import { and, asc, eq, gte, lt, or, sql } from "drizzle-orm";

import { db } from "@/db";
import { accountCategories } from "@/db/schema/finance/account_categories";
import { chartOfAccounts } from "@/db/schema/finance/chart_of_accounts";
import { expenseCategories } from "@/db/schema/finance/expense_categories";
import { expenses } from "@/db/schema/finance/expenses";
import { incomes } from "@/db/schema/finance/incomes";
import { journalEntries } from "@/db/schema/finance/journal_entries";
import { journalEntryLines } from "@/db/schema/finance/journal_entry_lines";
import { sales } from "@/db/schema/sales/sales";
import { saleItems } from "@/db/schema/sales/sale_items";
import { products } from "@/db/schema/inventory/products";
import { payments } from "@/db/schema/sales/payments";
import { cashAccounts } from "@/db/schema/finance/cash_accounts";
import { ensureFinanceDefaults } from "@/features/finance/services/finance.service";

function dayStart(d: string) {
  // Nairobi midnight; widen ±3h so UTC server timestamps still fall in-range
  return new Date(new Date(`${d}T00:00:00+03:00`).getTime() - 3 * 60 * 60 * 1000);
}
function dayEndEx(d: string) {
  const x = new Date(`${d}T00:00:00+03:00`);
  x.setDate(x.getDate() + 1);
  return new Date(x.getTime() + 3 * 60 * 60 * 1000);
}

type AccountBalance = {
  accountId: string;
  accountCode: string;
  accountName: string;
  categoryCode: string;
  categoryName: string;
  debit: number;
  credit: number;
  /** Signed balance: assets/expenses debit-normal; liabilities/equity/revenue credit-normal */
  balance: number;
};

export class FinancialStatementsService {
  private async ledgerBalances(
    businessId: string,
    opts: { from?: Date; toExclusive: Date },
  ): Promise<AccountBalance[]> {
    await ensureFinanceDefaults(businessId);

    const conditions = [
      eq(journalEntries.businessId, businessId),
      eq(journalEntries.status, "POSTED"),
      lt(journalEntries.transactionDate, opts.toExclusive),
    ];
    if (opts.from) {
      conditions.push(gte(journalEntries.transactionDate, opts.from));
    }

    const rows = await db
      .select({
        accountId: chartOfAccounts.id,
        accountCode: chartOfAccounts.accountCode,
        accountName: chartOfAccounts.accountName,
        categoryCode: accountCategories.code,
        categoryName: accountCategories.name,
        debit: sql<string>`coalesce(sum(${journalEntryLines.debit}::numeric), 0)`,
        credit: sql<string>`coalesce(sum(${journalEntryLines.credit}::numeric), 0)`,
      })
      .from(journalEntryLines)
      .innerJoin(
        journalEntries,
        eq(journalEntryLines.journalEntryId, journalEntries.id),
      )
      .innerJoin(
        chartOfAccounts,
        eq(journalEntryLines.accountId, chartOfAccounts.id),
      )
      .innerJoin(
        accountCategories,
        eq(chartOfAccounts.accountCategoryId, accountCategories.id),
      )
      .where(and(...conditions))
      .groupBy(
        chartOfAccounts.id,
        chartOfAccounts.accountCode,
        chartOfAccounts.accountName,
        accountCategories.code,
        accountCategories.name,
      )
      .orderBy(asc(chartOfAccounts.accountCode));

    // Category normal balances
    const debitNormal = new Set(["CA", "NCA", "INV", "COGS", "OPEX", "EXP"]);
    return rows.map((r) => {
      const debit = Number(r.debit ?? 0);
      const credit = Number(r.credit ?? 0);
      const cat = String(r.categoryCode);
      const balance = debitNormal.has(cat) ? debit - credit : credit - debit;
      return {
        accountId: r.accountId,
        accountCode: r.accountCode,
        accountName: r.accountName,
        categoryCode: cat,
        categoryName: String(r.categoryName),
        debit,
        credit,
        balance,
      };
    });
  }


  /** POS payments received + expenses paid, by tender channel (cash/M-Pesa/card/bank). */
  async cashMovements(businessId: string, fromDate: string, toDate: string) {
    const start = dayStart(fromDate);
    const end = dayEndEx(toDate);

    const received = await db
      .select({
        method: payments.method,
        total: sql<string>`coalesce(sum(${payments.amount}::numeric), 0)`,
        count: sql<number>`count(*)::int`,
      })
      .from(payments)
      .where(
        and(
          eq(payments.businessId, businessId),
          eq(payments.status, "COMPLETED"),
          gte(payments.paidAt, start),
          lt(payments.paidAt, end),
        ),
      )
      .groupBy(payments.method)
      .orderBy(payments.method);

    const paid = await db
      .select({
        channel: sql<string>`coalesce(${cashAccounts.name}, 'Unassigned')`,
        accountType: cashAccounts.type,
        total: sql<string>`coalesce(sum(${expenses.amount}::numeric), 0)`,
        count: sql<number>`count(*)::int`,
      })
      .from(expenses)
      .leftJoin(cashAccounts, eq(expenses.cashAccountId, cashAccounts.id))
      .where(
        and(
          eq(expenses.businessId, businessId),
          or(
            and(
              gte(expenses.expenseDate, start),
              lt(expenses.expenseDate, end),
            ),
            and(
              gte(expenses.createdAt, start),
              lt(expenses.createdAt, end),
            ),
          ),
        ),
      )
      .groupBy(cashAccounts.name, cashAccounts.type)
      .orderBy(sql`sum(${expenses.amount}::numeric) desc`);

    const totalReceived = received.reduce((s, r) => s + Number(r.total ?? 0), 0);
    const totalPaid = paid.reduce((s, r) => s + Number(r.total ?? 0), 0);

    return {
      fromDate,
      toDate,
      receivedByMethod: received.map((r) => ({
        method: String(r.method),
        total: Number(r.total ?? 0),
        count: Number(r.count ?? 0),
      })),
      paidByChannel: paid.map((r) => ({
        channel: String(r.channel ?? "Unassigned"),
        accountType: r.accountType ? String(r.accountType) : null,
        total: Number(r.total ?? 0),
        count: Number(r.count ?? 0),
      })),
      totalReceived,
      totalPaid,
      netCash: totalReceived - totalPaid,
    };
  }

  /** Operating expenses from the expenses module (cash register). */
  async expenseReport(businessId: string, fromDate: string, toDate: string) {
    const start = dayStart(fromDate);
    const end = dayEndEx(toDate);

    const lines = await db
      .select({
        id: expenses.id,
        expenseDate: expenses.expenseDate,
        description: expenses.description,
        amount: expenses.amount,
        status: expenses.status,
        paidTo: expenses.paidTo,
        reference: expenses.reference,
        categoryName: expenseCategories.name,
      })
      .from(expenses)
      .innerJoin(
        expenseCategories,
        eq(expenses.categoryId, expenseCategories.id),
      )
      .where(
        and(
          eq(expenses.businessId, businessId),
          or(
            and(
              gte(expenses.expenseDate, start),
              lt(expenses.expenseDate, end),
            ),
            and(
              gte(expenses.createdAt, start),
              lt(expenses.createdAt, end),
            ),
          ),
        ),
      )
      .orderBy(asc(expenses.expenseDate));

    const byCategory = await db
      .select({
        categoryName: expenseCategories.name,
        total: sql<string>`coalesce(sum(${expenses.amount}::numeric), 0)`,
        count: sql<number>`count(*)::int`,
      })
      .from(expenses)
      .innerJoin(
        expenseCategories,
        eq(expenses.categoryId, expenseCategories.id),
      )
      .where(
        and(
          eq(expenses.businessId, businessId),
          or(
            and(
              gte(expenses.expenseDate, start),
              lt(expenses.expenseDate, end),
            ),
            and(
              gte(expenses.createdAt, start),
              lt(expenses.createdAt, end),
            ),
          ),
        ),
      )
      .groupBy(expenseCategories.name)
      .orderBy(sql`sum(${expenses.amount}::numeric) desc`);

    const total = lines.reduce((s, l) => s + Number(l.amount ?? 0), 0);

    return {
      fromDate,
      toDate,
      total,
      byCategory: byCategory.map((c) => ({
        categoryName: c.categoryName,
        total: Number(c.total ?? 0),
        count: Number(c.count ?? 0),
      })),
      lines: lines.map((l) => ({
        id: l.id,
        date: l.expenseDate
          ? new Date(l.expenseDate).toLocaleDateString("en-KE", {
              timeZone: "UTC",
              day: "2-digit",
              month: "short",
              year: "numeric",
            })
          : "—",
        description: l.description,
        categoryName: l.categoryName,
        amount: Number(l.amount ?? 0),
        status: String(l.status),
        paidTo: l.paidTo,
        reference: l.reference,
      })),
    };
  }

  /**
   * P&L for period from journals (REV, COGS, OPEX) with operational fallback
   * when journal coverage is thin.
   */
  async profitAndLoss(businessId: string, fromDate: string, toDate: string) {
    const start = dayStart(fromDate);
    const end = dayEndEx(toDate);
    const ledger = await this.ledgerBalances(businessId, {
      from: start,
      toExclusive: end,
    });

    const revenue = ledger.filter((a) =>
      ["REV", "INC", "OI"].includes(a.categoryCode),
    );
    const cogs = ledger.filter((a) => a.categoryCode === "COGS");
    const opex = ledger.filter((a) =>
      ["OPEX", "EXP"].includes(a.categoryCode),
    );

    let revenueTotal = revenue.reduce((s, a) => s + a.balance, 0);
    let cogsTotal = cogs.reduce((s, a) => s + a.balance, 0);
    let opexTotal = opex.reduce((s, a) => s + a.balance, 0);

    // Operational supplements (sales / expenses / other income modules)
    const [saleRow] = await db
      .select({
        total: sql<string>`coalesce(sum(${sales.total}::numeric), 0)`,
      })
      .from(sales)
      .where(
        and(
          eq(sales.businessId, businessId),
          eq(sales.status, "COMPLETED"),
          gte(sales.soldAt, start),
          lt(sales.soldAt, end),
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
          or(
            and(
              gte(expenses.expenseDate, start),
              lt(expenses.expenseDate, end),
            ),
            and(
              gte(expenses.createdAt, start),
              lt(expenses.createdAt, end),
            ),
          ),
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
          gte(incomes.incomeDate, start),
          lt(incomes.incomeDate, end),
        ),
      );

    const salesTotal = Number(saleRow?.total ?? 0);
    const cashExpenses = Number(expRow?.total ?? 0);
    const otherIncome = Number(incRow?.total ?? 0);

    // Estimated COGS from product cost × qty on completed sales in range
    const cogsRows = await db
      .select({
        total: sql<string>`coalesce(sum(
          coalesce(${products.costPrice}::numeric, 0) *
          coalesce(${saleItems.quantity}::numeric, 0)
        ), 0)`,
      })
      .from(saleItems)
      .innerJoin(sales, eq(saleItems.saleId, sales.id))
      .innerJoin(products, eq(saleItems.productId, products.id))
      .where(
        and(
          eq(sales.businessId, businessId),
          eq(sales.status, "COMPLETED"),
          gte(sales.soldAt, start),
          lt(sales.soldAt, end),
        ),
      );
    const estimatedCogs = Number(cogsRows[0]?.total ?? 0);

    // Prefer operational figures when journals are incomplete
    if (salesTotal > revenueTotal) {
      revenueTotal = salesTotal;
    }
    if (otherIncome > 0 && revenueTotal < salesTotal + otherIncome) {
      // only add other income once if sales already replaced revenue
      if (salesTotal >= Number(saleRow?.total ?? 0)) {
        revenueTotal = salesTotal + otherIncome;
      }
    } else if (otherIncome > 0 && salesTotal <= 0) {
      revenueTotal = Math.max(revenueTotal, otherIncome);
    }
    cogsTotal = Math.max(cogsTotal, estimatedCogs);
    opexTotal = Math.max(opexTotal, cashExpenses);

    const grossProfit = revenueTotal - cogsTotal;
    const netProfit = grossProfit - opexTotal;

    const cash = await this.cashMovements(businessId, fromDate, toDate);

    return {
      fromDate,
      toDate,
      revenue: {
        total: revenueTotal,
        lines: revenue.filter((a) => Math.abs(a.balance) > 0.0001),
        salesTotal,
        otherIncome,
      },
      cogs: {
        total: cogsTotal,
        estimatedFromProducts: estimatedCogs,
        lines: cogs.filter((a) => Math.abs(a.balance) > 0.0001),
      },
      operatingExpenses: {
        total: opexTotal,
        lines: opex.filter((a) => Math.abs(a.balance) > 0.0001),
        cashExpenses,
      },
      cash,
      grossProfit,
      netProfit,
    };
  }

  /** Balance sheet as at end of toDate (cumulative journals). */
  async balanceSheet(businessId: string, asOfDate: string) {
    const end = dayEndEx(asOfDate);
    const ledger = await this.ledgerBalances(businessId, {
      toExclusive: end,
    });

    const assets = ledger.filter((a) =>
      ["CA", "NCA", "ASSET", "INV"].includes(a.categoryCode),
    );
    const liabilities = ledger.filter((a) =>
      ["CL", "NCL", "LIAB", "LTL"].includes(a.categoryCode),
    );
    const equity = ledger.filter((a) =>
      ["EQ", "EQUITY"].includes(a.categoryCode),
    );

    // Period P&L feeds retained earnings display
    const ytd = await this.profitAndLoss(businessId, "2000-01-01", asOfDate);

    const totalAssets = assets.reduce((s, a) => s + a.balance, 0);
    const totalLiabilities = liabilities.reduce((s, a) => s + a.balance, 0);
    const totalEquityBooks = equity.reduce((s, a) => s + a.balance, 0);
    const retained = ytd.netProfit;
    const totalEquity = totalEquityBooks + retained;
    const totalLiabEquity = totalLiabilities + totalEquity;

    return {
      asOfDate,
      assets: {
        total: totalAssets,
        lines: assets.filter((a) => Math.abs(a.balance) > 0.0001),
      },
      liabilities: {
        total: totalLiabilities,
        lines: liabilities.filter((a) => Math.abs(a.balance) > 0.0001),
      },
      equity: {
        total: totalEquity,
        bookEquity: totalEquityBooks,
        retainedEarnings: retained,
        lines: equity.filter((a) => Math.abs(a.balance) > 0.0001),
      },
      totalLiabilitiesAndEquity: totalLiabEquity,
      balanced: Math.abs(totalAssets - totalLiabEquity) < 1,
      difference: totalAssets - totalLiabEquity,
    };
  }

  async assetsAndLiabilities(businessId: string, asOfDate: string) {
    const bs = await this.balanceSheet(businessId, asOfDate);
    return {
      asOfDate,
      assets: bs.assets,
      liabilities: bs.liabilities,
      netAssets: bs.assets.total - bs.liabilities.total,
    };
  }
}

export const financialStatementsService = new FinancialStatementsService();
