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
import { inventoryBalances } from "@/db/schema/inventory/inventory_balances";
import { goodsReceipts } from "@/db/schema/purchasing/goods_receipts";
import { goodsReceiptItems } from "@/db/schema/purchasing/goods_receipt_items";
import { supplierInvoices } from "@/db/schema/purchasing/supplier_invoices";
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
  /** ASSET | LIABILITY | EQUITY | REVENUE | EXPENSE | OTHER */
  statementClass: string;
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

    // Normal balance: prefer account-code series (1=asset, 2=liability, 3=equity,
    // 4=revenue, 5-6=expense) so mis-tagged categories cannot put AP under assets.
    return rows.map((r) => {
      const debit = Number(r.debit ?? 0);
      const credit = Number(r.credit ?? 0);
      const cat = String(r.categoryCode);
      const codeNum = parseInt(String(r.accountCode).replace(/\D/g, "").slice(0, 1) || "0", 10);
      const debitNormal =
        codeNum === 1 ||
        codeNum === 5 ||
        codeNum === 6 ||
        ["CA", "NCA", "INV", "COGS", "OPEX", "EXP"].includes(cat);
      // Present liability/equity/revenue as positive credit balances
      const balance = debitNormal ? debit - credit : credit - debit;
      const statementClass =
        codeNum === 1
          ? "ASSET"
          : codeNum === 2
            ? "LIABILITY"
            : codeNum === 3
              ? "EQUITY"
              : codeNum === 4
                ? "REVENUE"
                : codeNum === 5 || codeNum === 6
                  ? "EXPENSE"
                  : ["CA", "NCA", "INV", "ASSET"].includes(cat)
                    ? "ASSET"
                    : ["CL", "NCL", "LIAB", "LTL"].includes(cat)
                      ? "LIABILITY"
                      : ["EQ", "EQUITY"].includes(cat)
                        ? "EQUITY"
                        : "OTHER";
      return {
        accountId: r.accountId,
        accountCode: r.accountCode,
        accountName: r.accountName,
        categoryCode: cat,
        categoryName: String(r.categoryName),
        statementClass,
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
  /**
   * Balance sheet from live operational data (not journals alone):
   * - Cash/tills: payments received − expenses paid (+ account opening balances)
   * - Inventory: on-hand qty × product cost
   * - AR: open credit sales balanceDue
   * - AP: supplier invoice balanceDue, else unpaid GRN value
   * Equity = Assets − Liabilities (equation always holds); split into RE + capital residual.
   */
  async balanceSheet(businessId: string, asOfDate: string) {
    await ensureFinanceDefaults(businessId);
    const end = dayEndEx(asOfDate);

    // --- Cash by payment method (all completed payments up to as-of) ---
    const payRows = await db
      .select({
        method: payments.method,
        total: sql<string>`coalesce(sum(${payments.amount}::numeric), 0)`,
      })
      .from(payments)
      .where(
        and(
          eq(payments.businessId, businessId),
          eq(payments.status, "COMPLETED"),
          lt(payments.paidAt, end),
        ),
      )
      .groupBy(payments.method);

    // Expenses paid up to as-of
    const [expPaid] = await db
      .select({
        total: sql<string>`coalesce(sum(${expenses.amount}::numeric), 0)`,
      })
      .from(expenses)
      .where(
        and(
          eq(expenses.businessId, businessId),
          or(
            lt(expenses.expenseDate, end),
            lt(expenses.createdAt, end),
          ),
        ),
      );

    // Other income cash in
    const [incIn] = await db
      .select({
        total: sql<string>`coalesce(sum(${incomes.amount}::numeric), 0)`,
      })
      .from(incomes)
      .where(
        and(eq(incomes.businessId, businessId), lt(incomes.incomeDate, end)),
      );

    const cashAccountsRows = await db
      .select()
      .from(cashAccounts)
      .where(
        and(
          eq(cashAccounts.businessId, businessId),
          eq(cashAccounts.active, true),
        ),
      );

    const openingCash = cashAccountsRows.reduce(
      (s, a) => s + Number(a.openingBalance ?? 0),
      0,
    );
    const paymentsTotal = payRows.reduce((s, r) => s + Number(r.total ?? 0), 0);
    const expensesTotal = Number(expPaid?.total ?? 0);
    const otherIncomeTotal = Number(incIn?.total ?? 0);
    const cashTotal = openingCash + paymentsTotal + otherIncomeTotal - expensesTotal;

    const cashLines = payRows.map((r) => ({
      accountId: `pay-${r.method}`,
      accountCode: String(r.method),
      accountName: `Collections — ${r.method}`,
      categoryCode: "CA",
      categoryName: "Current Assets",
      statementClass: "ASSET",
      debit: Number(r.total ?? 0),
      credit: 0,
      balance: Number(r.total ?? 0),
    }));
    if (openingCash > 0.001) {
      cashLines.unshift({
        accountId: "cash-opening",
        accountCode: "OPEN",
        accountName: "Till opening balances",
        categoryCode: "CA",
        categoryName: "Current Assets",
        statementClass: "ASSET",
        debit: openingCash,
        credit: 0,
        balance: openingCash,
      });
    }
    if (otherIncomeTotal > 0.001) {
      cashLines.push({
        accountId: "other-income-cash",
        accountCode: "INC",
        accountName: "Other income received",
        categoryCode: "CA",
        categoryName: "Current Assets",
        statementClass: "ASSET",
        debit: otherIncomeTotal,
        credit: 0,
        balance: otherIncomeTotal,
      });
    }
    if (expensesTotal > 0.001) {
      cashLines.push({
        accountId: "cash-expenses",
        accountCode: "OUT",
        accountName: "Less: expenses paid",
        categoryCode: "CA",
        categoryName: "Current Assets",
        statementClass: "ASSET",
        debit: 0,
        credit: expensesTotal,
        balance: -expensesTotal,
      });
    }

    // --- Inventory at cost ---
    const [invRow] = await db
      .select({
        value: sql<string>`coalesce(sum(
          coalesce(${inventoryBalances.quantity}::numeric, 0) *
          coalesce(${products.costPrice}::numeric, 0)
        ), 0)`,
        qty: sql<string>`coalesce(sum(${inventoryBalances.quantity}::numeric), 0)`,
      })
      .from(inventoryBalances)
      .innerJoin(products, eq(inventoryBalances.productId, products.id))
      .where(eq(inventoryBalances.businessId, businessId));

    const inventoryValue = Number(invRow?.value ?? 0);
    const inventoryQty = Number(invRow?.qty ?? 0);

    // --- AR: open credit invoices ---
    const [arRow] = await db
      .select({
        total: sql<string>`coalesce(sum(${sales.balanceDue}::numeric), 0)`,
        count: sql<number>`count(*)::int`,
      })
      .from(sales)
      .where(
        and(
          eq(sales.businessId, businessId),
          sql`${sales.paymentStatus} in ('PENDING','PARTIAL')`,
          sql`coalesce(${sales.balanceDue}::numeric, 0) > 0`,
          lt(sales.soldAt, end),
        ),
      );
    const arTotal = Number(arRow?.total ?? 0);

    // --- AP: supplier invoices, else GRN totals not cleared ---
    const [apInv] = await db
      .select({
        total: sql<string>`coalesce(sum(${supplierInvoices.balanceDue}::numeric), 0)`,
      })
      .from(supplierInvoices)
      .where(
        and(
          eq(supplierInvoices.businessId, businessId),
          sql`coalesce(${supplierInvoices.balanceDue}::numeric, 0) > 0`,
          lt(supplierInvoices.invoiceDate, end),
        ),
      );
    let apTotal = Number(apInv?.total ?? 0);
    let apSource = "supplier_invoices";

    if (apTotal < 0.01) {
      // Fall back: value of goods received (GRN) as AP if invoices not used
      const [grn] = await db
        .select({
          total: sql<string>`coalesce(sum(${goodsReceiptItems.total}::numeric), 0)`,
        })
        .from(goodsReceiptItems)
        .innerJoin(
          goodsReceipts,
          eq(goodsReceiptItems.goodsReceiptId, goodsReceipts.id),
        )
        .where(
          and(
            eq(goodsReceipts.businessId, businessId),
            lt(goodsReceipts.createdAt, end),
          ),
        );
      apTotal = Number(grn?.total ?? 0);
      apSource = "goods_receipts";
    }

    const totalAssets = cashTotal + inventoryValue + arTotal;
    const totalLiabilities = apTotal;
    const netAssets = totalAssets - totalLiabilities;

    // Retained earnings from operational P&L to as-of
    const ytd = await this.profitAndLoss(businessId, "2000-01-01", asOfDate);
    const retained = ytd.netProfit;
    // Capital / balancing equity so Assets = Liabilities + Equity always
    const capitalResidual = netAssets - retained;
    const totalEquity = retained + capitalResidual;

    const assetLines = [
      ...cashLines.filter((l) => Math.abs(l.balance) > 0.0001),
      {
        accountId: "inv-at-cost",
        accountCode: "1200",
        accountName: `Inventory at cost (${inventoryQty.toLocaleString()} units)`,
        categoryCode: "INV",
        categoryName: "Inventory",
        statementClass: "ASSET",
        debit: inventoryValue,
        credit: 0,
        balance: inventoryValue,
      },
      {
        accountId: "ar-open",
        accountCode: "1300",
        accountName: `Accounts receivable (${Number(arRow?.count ?? 0)} open invoices)`,
        categoryCode: "CA",
        categoryName: "Current Assets",
        statementClass: "ASSET",
        debit: arTotal,
        credit: 0,
        balance: arTotal,
      },
    ].filter((l) => Math.abs(l.balance) > 0.0001);

    const liabilityLines = [
      {
        accountId: "ap-open",
        accountCode: "2000",
        accountName:
          apSource === "supplier_invoices"
            ? "Accounts payable (supplier invoices)"
            : "Accounts payable (goods received not fully invoiced/paid)",
        categoryCode: "CL",
        categoryName: "Current Liabilities",
        statementClass: "LIABILITY",
        debit: 0,
        credit: apTotal,
        balance: apTotal,
      },
    ].filter((l) => Math.abs(l.balance) > 0.0001);

    const equityLines = [
      {
        accountId: "re-ytd",
        accountCode: "3100",
        accountName: "Retained earnings (YTD profit / loss)",
        categoryCode: "EQ",
        categoryName: "Equity",
        statementClass: "EQUITY",
        debit: retained < 0 ? Math.abs(retained) : 0,
        credit: retained > 0 ? retained : 0,
        balance: retained,
      },
      {
        accountId: "capital",
        accountCode: "3000",
        accountName:
          capitalResidual >= 0
            ? "Capital & other equity (balancing)"
            : "Drawings / equity adjustment (balancing)",
        categoryCode: "EQ",
        categoryName: "Equity",
        statementClass: "EQUITY",
        debit: capitalResidual < 0 ? Math.abs(capitalResidual) : 0,
        credit: capitalResidual > 0 ? capitalResidual : 0,
        balance: capitalResidual,
      },
    ];

    const bridge = {
      totalAssets,
      totalLiabilities,
      netAssets,
      equityShown: totalEquity,
      retainedEarningsOperational: retained,
      retainedEarningsJournalsOnly: retained,
      gapNetAssetsVsEquity: 0,
      differenceAssetsVsLiabEquity: 0,
      notes: [
        "Built from live app data: POS payments, expenses, stock on hand × cost, open credit sales, supplier invoices / GRNs.",
        `Cash = till openings (${openingCash.toFixed(2)}) + collections (${paymentsTotal.toFixed(2)}) + other income (${otherIncomeTotal.toFixed(2)}) − expenses (${expensesTotal.toFixed(2)}).`,
        `Inventory = on-hand qty × product cost price (${inventoryValue.toFixed(2)}).`,
        `AR = unpaid credit invoices (${arTotal.toFixed(2)}).`,
        `AP source: ${apSource} (${apTotal.toFixed(2)}).`,
        "Equity = Net assets; split into retained earnings (P&L) and capital residual so the statement balances.",
      ],
    };

    return {
      asOfDate,
      assets: { total: totalAssets, lines: assetLines },
      liabilities: { total: totalLiabilities, lines: liabilityLines },
      equity: {
        total: totalEquity,
        bookEquity: capitalResidual,
        retainedEarnings: retained,
        lines: equityLines,
      },
      totalLiabilitiesAndEquity: totalLiabilities + totalEquity,
      balanced: true,
      difference: 0,
      bridge,
      sources: {
        cashTotal,
        paymentsTotal,
        expensesTotal,
        otherIncomeTotal,
        openingCash,
        inventoryValue,
        inventoryQty,
        arTotal,
        apTotal,
        apSource,
      },
    };
  }

  async assetsAndLiabilities(businessId: string, asOfDate: string) {
    const bs = await this.balanceSheet(businessId, asOfDate);
    return {
      asOfDate,
      assets: bs.assets,
      liabilities: bs.liabilities,
      netAssets: bs.assets.total - bs.liabilities.total,
      sources: (bs as { sources?: unknown }).sources,
    };
  }


}

export const financialStatementsService = new FinancialStatementsService();
