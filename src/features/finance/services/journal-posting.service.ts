import { and, eq, sql } from "drizzle-orm";

import { db } from "@/db";
import { chartOfAccounts } from "@/db/schema/finance/chart_of_accounts";
import { journalEntries } from "@/db/schema/finance/journal_entries";
import { journalEntryLines } from "@/db/schema/finance/journal_entry_lines";
import { ensureFinanceDefaults } from "./finance.service";
import { numberingSequencesService } from "@/features/settings/services/numbering-sequences.service";

type SourceType =
  | "SALE"
  | "PURCHASE"
  | "EXPENSE"
  | "INCOME"
  | "PAYMENT"
  | "RECEIPT"
  | "PURCHASE_RETURN"
  | "SALES_RETURN"
  | "STOCK_ADJUSTMENT"
  | "STOCK_TRANSFER"
  | "OPENING_BALANCE"
  | "MANUAL_JOURNAL";

type Line = {
  accountCode: string;
  debit?: string;
  credit?: string;
  description?: string;
};

/**
 * System double-entry posting. Failures are logged but do not throw to callers
 * unless throwOnError is set — operational sales/GRN must not break if CoA is incomplete.
 */
export class JournalPostingService {
  async accountByCode(businessId: string, code: string) {
    await ensureFinanceDefaults(businessId);
    const [row] = await db
      .select()
      .from(chartOfAccounts)
      .where(
        and(
          eq(chartOfAccounts.businessId, businessId),
          eq(chartOfAccounts.accountCode, code),
        ),
      )
      .limit(1);
    return row ?? null;
  }

  async post(input: {
    businessId: string;
    sourceType: SourceType;
    sourceId: string;
    description: string;
    reference?: string | null;
    postedBy?: string | null;
    lines: Line[];
    throwOnError?: boolean;
  }) {
    try {
      await ensureFinanceDefaults(input.businessId);

      const resolved: {
        accountId: string;
        debit: string;
        credit: string;
        description?: string;
      }[] = [];

      for (const line of input.lines) {
        const debit = Number(line.debit ?? 0);
        const credit = Number(line.credit ?? 0);
        if (debit === 0 && credit === 0) continue;
        const acct = await this.accountByCode(input.businessId, line.accountCode);
        if (!acct) {
          throw new Error(`Missing chart account ${line.accountCode}`);
        }
        resolved.push({
          accountId: acct.id,
          debit: debit.toFixed(2),
          credit: credit.toFixed(2),
          description: line.description,
        });
      }

      if (resolved.length < 2) {
        throw new Error("Journal needs at least two lines");
      }

      const totalDebit = resolved.reduce((s, l) => s + Number(l.debit), 0);
      const totalCredit = resolved.reduce((s, l) => s + Number(l.credit), 0);
      if (Math.abs(totalDebit - totalCredit) > 0.02) {
        throw new Error(
          `Unbalanced journal: debit ${totalDebit} != credit ${totalCredit}`,
        );
      }

      let journalNumber: string;
      try {
        journalNumber = await numberingSequencesService.nextDocumentNumber(
          input.businessId,
          "JOURNAL",
          null,
        );
      } catch {
        const seq = await db
          .select({
            n: sql<number>`count(*)::int`,
          })
          .from(journalEntries)
          .where(eq(journalEntries.businessId, input.businessId));
        journalNumber = `JV-${String((seq[0]?.n ?? 0) + 1).padStart(6, "0")}`;
      }

      const [entry] = await db
        .insert(journalEntries)
        .values({
          businessId: input.businessId,
          journalNumber,
          description: input.description,
          reference: input.reference ?? null,
          sourceType: input.sourceType,
          sourceId: input.sourceId,
          postedBy: input.postedBy ?? null,
          status: "POSTED",
          isSystemGenerated: true,
        })
        .returning();

      let lineNumber = 1;
      for (const line of resolved) {
        await db.insert(journalEntryLines).values({
          journalEntryId: entry.id,
          lineNumber: lineNumber++,
          accountId: line.accountId,
          description: line.description ?? input.description,
          debit: line.debit,
          credit: line.credit,
        });
      }

      return entry;
    } catch (e) {
      console.error("[journal-posting]", e);
      if (input.throwOnError) throw e;
      return null;
    }
  }

  /** Cash/bank sale: Dr Cash, Cr Sales; Dr COGS, Cr Inventory (if cogs provided) */
  async postSale(input: {
    businessId: string;
    saleId: string;
    invoiceNumber: string;
    total: number;
    cogs?: number;
    postedBy?: string | null;
    cashAccountCode?: string;
    /** Credit / on-account sale → Dr Accounts Receivable instead of Cash */
    isCredit?: boolean;
  }) {
    const debitCode = input.isCredit
      ? "1300"
      : (input.cashAccountCode ?? "1000");
    const lines: Line[] = [
      {
        accountCode: debitCode,
        debit: input.total.toFixed(2),
        description: input.isCredit
          ? `AR invoice ${input.invoiceNumber}`
          : `Cash sale ${input.invoiceNumber}`,
      },
      {
        accountCode: "4000",
        credit: input.total.toFixed(2),
        description: input.isCredit
          ? `Credit sales ${input.invoiceNumber}`
          : `Cash sale ${input.invoiceNumber}`,
      },
    ];
    if (input.cogs && input.cogs > 0) {
      lines.push(
        {
          accountCode: "5000",
          debit: input.cogs.toFixed(2),
          description: `COGS ${input.invoiceNumber}`,
        },
        {
          accountCode: "1200",
          credit: input.cogs.toFixed(2),
          description: `Inventory out ${input.invoiceNumber}`,
        },
      );
    }
    return this.post({
      businessId: input.businessId,
      sourceType: "SALE",
      sourceId: input.saleId,
      description: input.isCredit
        ? `Credit invoice ${input.invoiceNumber}`
        : `Cash sale ${input.invoiceNumber}`,
      reference: input.invoiceNumber,
      postedBy: input.postedBy,
      lines,
    });
  }


  /** Customer pays credit invoice: Dr Cash, Cr Accounts Receivable */
  async postArCollection(input: {
    businessId: string;
    saleId: string;
    invoiceNumber: string;
    amount: number;
    paymentId?: string;
    postedBy?: string | null;
    cashAccountCode?: string;
  }) {
    if (input.amount <= 0) return null;
    const cashCode = input.cashAccountCode ?? "1000";
    return this.post({
      businessId: input.businessId,
      sourceType: "PAYMENT",
      sourceId: input.paymentId ?? input.saleId,
      description: `AR collection ${input.invoiceNumber}`,
      reference: input.invoiceNumber,
      postedBy: input.postedBy,
      lines: [
        {
          accountCode: cashCode,
          debit: input.amount.toFixed(2),
          description: `Payment received ${input.invoiceNumber}`,
        },
        {
          accountCode: "1300",
          credit: input.amount.toFixed(2),
          description: `Clear AR ${input.invoiceNumber}`,
        },
      ],
    });
  }

  /** GRN / purchase receive: Dr Inventory, Cr Accounts Payable (or Cash if paid) */
  async postPurchaseReceive(input: {
    businessId: string;
    sourceId: string;
    reference: string;
    amount: number;
    postedBy?: string | null;
    paidCash?: boolean;
  }) {
    if (input.amount <= 0) return null;
    const creditCode = input.paidCash ? "1000" : "2000";
    return this.post({
      businessId: input.businessId,
      sourceType: "PURCHASE",
      sourceId: input.sourceId,
      description: `Goods received ${input.reference}`,
      reference: input.reference,
      postedBy: input.postedBy,
      lines: [
        {
          accountCode: "1200",
          debit: input.amount.toFixed(2),
          description: `Inventory in ${input.reference}`,
        },
        {
          accountCode: creditCode,
          credit: input.amount.toFixed(2),
          description: input.paidCash
            ? `Cash purchase ${input.reference}`
            : `AP ${input.reference}`,
        },
      ],
    });
  }
}

export const journalPostingService = new JournalPostingService();
