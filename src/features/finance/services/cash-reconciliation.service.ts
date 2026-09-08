import { nairobiDateBounds } from "@/lib/timezone";
import { and, desc, eq, gte, inArray, isNull, lt, or, sql } from "drizzle-orm";

import { db } from "@/db";
import { cashAccounts } from "@/db/schema/finance/cash_accounts";
import { cashReconciliations } from "@/db/schema/finance/cash_reconciliations";
import { payments } from "@/db/schema/sales/payments";
import { expenses } from "@/db/schema/finance/expenses";
import { incomes } from "@/db/schema/finance/incomes";
import { journalEntries } from "@/db/schema/finance/journal_entries";
import { journalEntryLines } from "@/db/schema/finance/journal_entry_lines";


function dayBounds(dateStr: string) {
  // Match nowNairobiWallClock / paidAt / soldAt storage (EAT wall clock in UTC fields)
  const { start, end } = nairobiDateBounds(dateStr);
  return { start, end, dayStart: start, dayEnd: end };
}

/** Map POS payment method → cash account channel type / name hint */
export function paymentMethodsForAccount(account: {
  type: string;
  name: string;
}): string[] {
  const name = (account.name || "").toLowerCase();
  switch (account.type) {
    case "CASH":
    case "PETTY_CASH":
      return ["CASH"];
    case "MPESA":
      return ["MPESA"];
    case "MOBILE_MONEY":
      return ["MOBILE_MONEY"];
    case "BANK":
      if (name.includes("card")) return ["CARD"];
      return ["BANK_TRANSFER", "CHEQUE"];
    default:
      return [];
  }
}


export class CashReconciliationService {
  async listAccounts(businessId: string) {
    return db
      .select()
      .from(cashAccounts)
      .where(
        and(eq(cashAccounts.businessId, businessId), eq(cashAccounts.active, true)),
      )
      .orderBy(cashAccounts.name);
  }

  /**
   * System movement for one cash account on a calendar day.
   * Inflows: POS/sale payments + other income
   * Outflows: expenses paid from this account
   */
  async computeDaySummary(
    businessId: string,
    cashAccountId: string,
    dateStr: string,
  ) {
    const { start, end } = dayBounds(dateStr);

    const [account] = await db
      .select()
      .from(cashAccounts)
      .where(
        and(
          eq(cashAccounts.id, cashAccountId),
          eq(cashAccounts.businessId, businessId),
        ),
      )
      .limit(1);

    if (!account) {
      throw new Error("Cash account not found.");
    }

    // Prior completed reconciliation opening = that day's counted balance
    const [prior] = await db
      .select()
      .from(cashReconciliations)
      .where(
        and(
          eq(cashReconciliations.businessId, businessId),
          eq(cashReconciliations.cashAccountId, cashAccountId),
          lt(cashReconciliations.reconciliationDate, dateStr),
        ),
      )
      .orderBy(desc(cashReconciliations.reconciliationDate))
      .limit(1);

    // Opening = last saved counted balance, else setup opening field.
    // It does NOT auto-roll from ledger until you save a reconciliation.
    const opening = prior
      ? Number(prior.countedBalance)
      : Number(account.openingBalance ?? 0);

    const methods = paymentMethodsForAccount(account);
    // POS: match method for this till OR payment explicitly linked to this cash account
    const [payRow] = await db
      .select({
        total: sql<string>`coalesce(sum(${payments.amount}::numeric), 0)`,
      })
      .from(payments)
      .where(
        and(
          eq(payments.businessId, businessId),
          eq(payments.status, "COMPLETED"),
          gte(payments.paidAt, start),
          lt(payments.paidAt, end),
          methods.length
            ? or(
                inArray(payments.method, methods as any),
                eq(payments.cashAccountId, cashAccountId),
              )
            : eq(payments.cashAccountId, cashAccountId),
        ),
      );

    const [incRow] = await db
      .select({
        total: sql<string>`coalesce(sum(${incomes.amount}::numeric), 0)`,
      })
      .from(incomes)
      .where(
        and(
          eq(incomes.businessId, businessId),
          eq(incomes.cashAccountId, cashAccountId),
          gte(incomes.incomeDate, start),
          lt(incomes.incomeDate, end),
        ),
      );

    const [expRow] = await db
      .select({
        total: sql<string>`coalesce(sum(${expenses.amount}::numeric), 0)`,
      })
      .from(expenses)
      .where(
        and(
          eq(expenses.businessId, businessId),
          eq(expenses.cashAccountId, cashAccountId),
          or(
            and(gte(expenses.expenseDate, start), lt(expenses.expenseDate, end)),
            and(gte(expenses.createdAt, start), lt(expenses.createdAt, end)),
          ),
        ),
      );

    // Supplier / AP pays: credits on this till's linked ledger for the day
    const [apPayRow] = await db
      .select({
        total: sql<string>`coalesce(sum(${journalEntryLines.credit}::numeric), 0)`,
      })
      .from(journalEntryLines)
      .innerJoin(
        journalEntries,
        eq(journalEntryLines.journalEntryId, journalEntries.id),
      )
      .where(
        and(
          eq(journalEntries.businessId, businessId),
          eq(journalEntries.status, "POSTED"),
          eq(journalEntries.sourceType, "PAYMENT"),
          eq(journalEntryLines.accountId, account.accountId),
          gte(journalEntries.transactionDate, start),
          lt(journalEntries.transactionDate, end),
          sql`coalesce(${journalEntryLines.credit}::numeric, 0) > 0`,
        ),
      );

    const paymentInflows = Number(payRow?.total ?? 0);
    const otherInflows = Number(incRow?.total ?? 0);
    const expenseOut = Number(expRow?.total ?? 0);
    const apOut = Number(apPayRow?.total ?? 0);
    const systemInflows = paymentInflows + otherInflows;
    const systemOutflows = expenseOut + apOut;
    const expectedBalance = opening + systemInflows - systemOutflows;

    return {
      account,
      openingBalance: opening,
      systemInflows,
      systemOutflows,
      expectedBalance,
      paymentInflows,
      otherInflows,
      expenseOutflows: expenseOut,
      apOutflows: apOut,
      methodsMatched: methods,
      openingSource: prior ? ("prior_recon" as const) : ("opening_field" as const),
    };
  }

  /** System totals for every active channel on a day (for end-of-day dashboard). */
  async listDayOverview(businessId: string, dateStr: string) {
    const accounts = await this.listAccounts(businessId);
    const rows = [];
    for (const account of accounts) {
      const summary = await this.computeDaySummary(
        businessId,
        account.id,
        dateStr,
      );
      rows.push({
        cashAccountId: account.id,
        name: account.name,
        type: account.type,
        openingBalance: summary.openingBalance,
        paymentInflows: summary.paymentInflows,
        otherInflows: summary.otherInflows,
        systemInflows: summary.systemInflows,
        systemOutflows: summary.systemOutflows,
        expectedBalance: summary.expectedBalance,
      });
    }
    return rows;
  }

  async listRecent(businessId: string, limit = 30) {

    return db
      .select({
        id: cashReconciliations.id,
        reconciliationDate: cashReconciliations.reconciliationDate,
        openingBalance: cashReconciliations.openingBalance,
        systemInflows: cashReconciliations.systemInflows,
        systemOutflows: cashReconciliations.systemOutflows,
        expectedBalance: cashReconciliations.expectedBalance,
        countedBalance: cashReconciliations.countedBalance,
        difference: cashReconciliations.difference,
        notes: cashReconciliations.notes,
        status: cashReconciliations.status,
        cashAccountId: cashReconciliations.cashAccountId,
        accountName: cashAccounts.name,
        accountType: cashAccounts.type,
      })
      .from(cashReconciliations)
      .innerJoin(
        cashAccounts,
        eq(cashReconciliations.cashAccountId, cashAccounts.id),
      )
      .where(eq(cashReconciliations.businessId, businessId))
      .orderBy(desc(cashReconciliations.reconciliationDate))
      .limit(limit);
  }

  async save(input: {
    businessId: string;
    cashAccountId: string;
    reconciliationDate: string;
    countedBalance: number;
    notes?: string | null;
    reconciledBy: string;
  }) {
    const summary = await this.computeDaySummary(
      input.businessId,
      input.cashAccountId,
      input.reconciliationDate,
    );

    const difference = input.countedBalance - summary.expectedBalance;

    const values = {
      businessId: input.businessId,
      cashAccountId: input.cashAccountId,
      reconciliationDate: input.reconciliationDate,
      openingBalance: summary.openingBalance.toFixed(2),
      systemInflows: summary.systemInflows.toFixed(2),
      systemOutflows: summary.systemOutflows.toFixed(2),
      expectedBalance: summary.expectedBalance.toFixed(2),
      countedBalance: input.countedBalance.toFixed(2),
      difference: difference.toFixed(2),
      notes: input.notes ?? null,
      status: "COMPLETED" as const,
      reconciledBy: input.reconciledBy,
      updatedAt: new Date(),
    };

    const [row] = await db
      .insert(cashReconciliations)
      .values(values)
      .onConflictDoUpdate({
        target: [
          cashReconciliations.businessId,
          cashReconciliations.cashAccountId,
          cashReconciliations.reconciliationDate,
        ],
        set: {
          openingBalance: values.openingBalance,
          systemInflows: values.systemInflows,
          systemOutflows: values.systemOutflows,
          expectedBalance: values.expectedBalance,
          countedBalance: values.countedBalance,
          difference: values.difference,
          notes: values.notes,
          status: values.status,
          reconciledBy: values.reconciledBy,
          updatedAt: values.updatedAt,
        },
      })
      .returning();

    return { row, summary, difference };
  }
}

export const cashReconciliationService = new CashReconciliationService();
