import { and, desc, eq, gte, inArray, isNull, lt, or, sql } from "drizzle-orm";

import { db } from "@/db";
import { cashAccounts } from "@/db/schema/finance/cash_accounts";
import { cashReconciliations } from "@/db/schema/finance/cash_reconciliations";
import { payments } from "@/db/schema/sales/payments";
import { expenses } from "@/db/schema/finance/expenses";
import { incomes } from "@/db/schema/finance/incomes";

function dayBounds(dateStr: string) {
  // dateStr = YYYY-MM-DD in Africa/Nairobi. Payments may be stored as:
  // - Nairobi wall-clock in timestamp without tz, or
  // - true UTC from defaultNow().
  // Use an inclusive window from previous UTC evening through next Nairobi midnight+buffer.
  const start = new Date(`${dateStr}T00:00:00+03:00`);
  const end = new Date(`${dateStr}T00:00:00+03:00`);
  end.setDate(end.getDate() + 1);
  // Widen by 3h each side so UTC "now" still falls on the intended business day
  const startWide = new Date(start.getTime() - 3 * 60 * 60 * 1000);
  const endWide = new Date(end.getTime() + 3 * 60 * 60 * 1000);
  return { start: startWide, end: endWide, dayStart: start, dayEnd: end };
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

    const opening = prior
      ? Number(prior.countedBalance)
      : Number(account.openingBalance ?? 0);

    const methods = paymentMethodsForAccount(account);
    // POS reconciliation is method-driven: CARD → Card Terminal, MPESA → M-Pesa, etc.
    // Also include rows explicitly linked to this account with no/unknown method mapping.
    const [payRow] = await db
      .select({
        total: sql<string>`coalesce(sum(${payments.amount}), 0)`,
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
                and(
                  eq(payments.cashAccountId, cashAccountId),
                  sql`${payments.method}::text not in ('CASH','MPESA','MOBILE_MONEY','CARD','BANK_TRANSFER','CHEQUE')`,
                ),
              )
            : eq(payments.cashAccountId, cashAccountId),
        ),
      );

    const [incRow] = await db
      .select({
        total: sql<string>`coalesce(sum(${incomes.amount}), 0)`,
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
        total: sql<string>`coalesce(sum(${expenses.amount}), 0)`,
      })
      .from(expenses)
      .where(
        and(
          eq(expenses.businessId, businessId),
          eq(expenses.cashAccountId, cashAccountId),
          gte(expenses.expenseDate, start),
          lt(expenses.expenseDate, end),
        ),
      );

    const systemInflows = Number(payRow?.total ?? 0) + Number(incRow?.total ?? 0);
    const systemOutflows = Number(expRow?.total ?? 0);
    const expectedBalance = opening + systemInflows - systemOutflows;

    return {
      account,
      openingBalance: opening,
      systemInflows,
      systemOutflows,
      expectedBalance,
      paymentInflows: Number(payRow?.total ?? 0),
      otherInflows: Number(incRow?.total ?? 0),
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
