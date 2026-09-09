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
import { saleItemBatches } from "@/db/schema/sales/sale_item_batches";
import { products } from "@/db/schema/inventory/products";
import { inventoryBalances } from "@/db/schema/inventory/inventory_balances";
import { productBatches } from "@/db/schema/inventory/product_batches";
import { goodsReceipts } from "@/db/schema/purchasing/goods_receipts";
import { goodsReceiptItems } from "@/db/schema/purchasing/goods_receipt_items";
import { supplierInvoices } from "@/db/schema/purchasing/supplier_invoices";
import { payments } from "@/db/schema/sales/payments";
import { cashAccounts } from "@/db/schema/finance/cash_accounts";
import {
  ensureFinanceDefaults,
  financeService,
} from "@/features/finance/services/finance.service";
import { nairobiDateRangeBounds } from "@/lib/timezone";

function dayStart(d: string) {
  return nairobiDateRangeBounds(d, d).start;
}
function dayEndEx(d: string) {
  return nairobiDateRangeBounds(d, d).end;
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

  /** COGS: prefer batch cost × qty from sale_item_batches; residual lines use product cost. */
  private async operationalCogs(
    businessId: string,
    start: Date,
    end: Date,
  ): Promise<{ total: number; fromBatches: number; fromProduct: number }> {
    const [batchRow] = await db
      .select({
        total: sql<string>`coalesce(sum(
          ${saleItemBatches.quantity}::numeric *
          coalesce(${productBatches.costPrice}::numeric, 0)
        ), 0)`,
      })
      .from(saleItemBatches)
      .innerJoin(saleItems, eq(saleItemBatches.saleItemId, saleItems.id))
      .innerJoin(sales, eq(saleItems.saleId, sales.id))
      .innerJoin(
        productBatches,
        eq(saleItemBatches.productBatchId, productBatches.id),
      )
      .where(
        and(
          eq(sales.businessId, businessId),
          eq(sales.status, "COMPLETED"),
          gte(sales.soldAt, start),
          lt(sales.soldAt, end),
        ),
      );
    const fromBatches = Number(batchRow?.total ?? 0);

    const [prodRow] = await db
      .select({
        total: sql<string>`coalesce(sum(
          coalesce(${products.costPrice}::numeric, 0) *
          coalesce(
            nullif(${saleItems.quantityStock}::numeric, 0),
            ${saleItems.quantity}::numeric
          )
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
          sql`not exists (
            select 1 from sale_item_batches sib
            where sib.sale_item_id = ${saleItems.id}
          )`,
        ),
      );
    const fromProduct = Number(prodRow?.total ?? 0);
    return {
      total: fromBatches + fromProduct,
      fromBatches,
      fromProduct,
    };
  }

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

    const incomeLines = await db
      .select({
        id: incomes.id,
        incomeDate: incomes.incomeDate,
        description: incomes.description,
        amount: incomes.amount,
        status: incomes.status,
      })
      .from(incomes)
      .where(
        and(
          eq(incomes.businessId, businessId),
          gte(incomes.incomeDate, start),
          lt(incomes.incomeDate, end),
        ),
      )
      .orderBy(asc(incomes.incomeDate));

    const otherIncomeTotal = incomeLines.reduce(
      (s, l) => s + Number(l.amount ?? 0),
      0,
    );

    // Trading result for Income|Expenses (gross profit already net of COGS)
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
    const salesTotal = Number(saleRow?.total ?? 0);

    const cogsOp = await this.operationalCogs(businessId, start, end);
    const cogsTotal = cogsOp.total;
    const grossProfit = salesTotal - cogsTotal;

    const cash = await this.cashMovements(businessId, fromDate, toDate);

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
      /** Non-POS income (Finance → Other income) */
      otherIncome: {
        total: otherIncomeTotal,
        lines: incomeLines.map((l) => ({
          id: l.id,
          date: l.incomeDate
            ? new Date(l.incomeDate).toLocaleDateString("en-KE", {
                timeZone: "UTC",
                day: "2-digit",
                month: "short",
                year: "numeric",
              })
            : "—",
          description: l.description ?? "Other income",
          amount: Number(l.amount ?? 0),
          status: String(l.status ?? "COMPLETED"),
        })),
      },
      /** POS receipts by method + expenses by till (cash control, not P&amp;L income) */
      cash,
      /** Trading: sales − estimated COGS (use on Income side with other income) */
      trading: {
        salesTotal,
        cogsTotal,
        grossProfit,
      },
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

    // COGS: batch cost when sale_item_batches exist; else product cost
    const cogsOp = await this.operationalCogs(businessId, start, end);
    const estimatedCogs = cogsOp.total;

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

    // --- P0: Cash = Cash & bank till ledgers (same as Finance → Cash accounts) ---
    const tills = await financeService.getCashAccountsWithBalances(
      businessId,
      end,
    );
    const seenGl = new Set<string>();
    const cashLines: AccountBalance[] = [];
    let cashTotal = 0;
    for (const till of tills) {
      // One line per GL account so shared ledgers are not double-counted
      if (seenGl.has(till.accountId)) continue;
      seenGl.add(till.accountId);
      const bal = Number(till.currentBalance ?? 0);
      cashTotal += bal;
      cashLines.push({
        accountId: till.id,
        accountCode: till.accountCode,
        accountName: `${till.name} (${till.type})`,
        categoryCode: "CA",
        categoryName: "Current Assets",
        statementClass: "ASSET",
        debit: bal > 0 ? bal : 0,
        credit: bal < 0 ? -bal : 0,
        balance: bal,
      });
    }

    // --- P1: Inventory = batch value for products with batch stock + plain for the rest ---
    const batchRows = await db
      .select({
        productId: productBatches.productId,
        value: sql<string>`coalesce(sum(
          coalesce(${productBatches.quantityRemaining}::numeric, 0) *
          coalesce(${productBatches.costPrice}::numeric, 0)
        ), 0)`,
        qty: sql<string>`coalesce(sum(coalesce(${productBatches.quantityRemaining}::numeric, 0)), 0)`,
      })
      .from(productBatches)
      .where(
        and(
          eq(productBatches.businessId, businessId),
          sql`coalesce(${productBatches.quantityRemaining}::numeric, 0) > 0`,
          eq(productBatches.active, true),
        ),
      )
      .groupBy(productBatches.productId);

    const batchByProduct = new Map(
      batchRows.map((r) => [
        r.productId,
        { value: Number(r.value), qty: Number(r.qty) },
      ]),
    );

    const balanceRows = await db
      .select({
        productId: inventoryBalances.productId,
        qty: sql<string>`coalesce(sum(${inventoryBalances.quantity}::numeric), 0)`,
        cost: sql<string>`coalesce(max(${products.costPrice}::numeric), 0)`,
      })
      .from(inventoryBalances)
      .innerJoin(products, eq(inventoryBalances.productId, products.id))
      .where(
        and(
          eq(inventoryBalances.businessId, businessId),
          sql`coalesce(${inventoryBalances.quantity}::numeric, 0) > 0`,
        ),
      )
      .groupBy(inventoryBalances.productId);

    let inventoryValue = 0;
    let inventoryQty = 0;
    const productSeen = new Set<string>();
    for (const row of balanceRows) {
      productSeen.add(row.productId);
      const batch = batchByProduct.get(row.productId);
      if (batch && batch.qty > 0.0001) {
        inventoryValue += batch.value;
        inventoryQty += batch.qty;
      } else {
        const q = Number(row.qty);
        const c = Number(row.cost);
        inventoryValue += q * c;
        inventoryQty += q;
      }
    }
    // Batches for products with no inventory_balances row (edge)
    for (const [pid, batch] of batchByProduct) {
      if (productSeen.has(pid)) continue;
      inventoryValue += batch.value;
      inventoryQty += batch.qty;
    }
    const inventorySource = "batch_or_product_cost_union";

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

    // --- P1: AP = open supplier invoices first; journals cross-check only ---
    const [apInv] = await db
      .select({
        total: sql<string>`coalesce(sum(${supplierInvoices.balanceDue}::numeric), 0)`,
        count: sql<number>`count(*)::int`,
        anyCount: sql<number>`count(*)::int`,
      })
      .from(supplierInvoices)
      .where(
        and(
          eq(supplierInvoices.businessId, businessId),
          lt(supplierInvoices.invoiceDate, end),
        ),
      );

    const [apOpen] = await db
      .select({
        total: sql<string>`coalesce(sum(${supplierInvoices.balanceDue}::numeric), 0)`,
        count: sql<number>`count(*)::int`,
      })
      .from(supplierInvoices)
      .where(
        and(
          eq(supplierInvoices.businessId, businessId),
          sql`coalesce(${supplierInvoices.balanceDue}::numeric, 0) > 0.009`,
          lt(supplierInvoices.invoiceDate, end),
        ),
      );

    const invoiceRowsEver = Number(apInv?.anyCount ?? 0);
    let apTotal = Number(apOpen?.total ?? 0);
    let apSource = "supplier_invoices";
    let apOpenCount = Number(apOpen?.count ?? 0);

    if (invoiceRowsEver === 0) {
      // No AP bills yet: optional journal net on 2000 only (no GRN total fallback)
      const [apLedger] = await db
        .select({
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
        .where(
          and(
            eq(journalEntries.businessId, businessId),
            eq(journalEntries.status, "POSTED"),
            eq(chartOfAccounts.accountCode, "2000"),
            lt(journalEntries.transactionDate, end),
          ),
        );
      const net = Number(apLedger?.credit ?? 0) - Number(apLedger?.debit ?? 0);
      if (net > 0.009) {
        apTotal = net;
        apSource = "posted_ap_ledger";
      } else {
        apTotal = 0;
        apSource = "none";
      }
    }

    const totalAssets = cashTotal + inventoryValue + arTotal;
    const totalLiabilities = apTotal;
    const netAssets = totalAssets - totalLiabilities;

    const ytd = await this.profitAndLoss(businessId, "2000-01-01", asOfDate);
    const retained = ytd.netProfit;
    const capitalResidual = netAssets - retained;
    const totalEquity = retained + capitalResidual;

    const assetLines: AccountBalance[] = [
      ...cashLines.filter((l) => Math.abs(l.balance) > 0.0001),
      {
        accountId: "inv-at-cost",
        accountCode: "1200",
        accountName: "Inventory at cost",
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
        accountName: "Accounts receivable (open invoices)",
        categoryCode: "CA",
        categoryName: "Current Assets",
        statementClass: "ASSET",
        debit: arTotal,
        credit: 0,
        balance: arTotal,
      },
    ].filter((l) => Math.abs(l.balance) > 0.0001);

    const liabilityLines: AccountBalance[] = [
      {
        accountId: "ap-open",
        accountCode: "2000",
        accountName: "Accounts payable (open supplier bills)",
        categoryCode: "CL",
        categoryName: "Current Liabilities",
        statementClass: "LIABILITY",
        debit: 0,
        credit: apTotal,
        balance: apTotal,
      },
    ].filter((l) => Math.abs(l.balance) > 0.0001);

    const equityLines: AccountBalance[] = [
      {
        accountId: "re-ytd",
        accountCode: "3100",
        accountName: "Retained earnings (YTD P&L)",
        categoryCode: "EQ",
        categoryName: "Equity",
        statementClass: "EQUITY",
        debit: retained < 0 ? -retained : 0,
        credit: retained > 0 ? retained : 0,
        balance: retained,
      },
      {
        accountId: "capital-residual",
        accountCode: "3000",
        accountName: "Owner equity / capital (balancing)",
        categoryCode: "EQ",
        categoryName: "Equity",
        statementClass: "EQUITY",
        debit: capitalResidual < 0 ? -capitalResidual : 0,
        credit: capitalResidual > 0 ? capitalResidual : 0,
        balance: capitalResidual,
      },
    ];

    const liabPlusEquity = totalLiabilities + totalEquity;
    return {
      asOfDate,
      assets: {
        total: totalAssets,
        cash: cashTotal,
        inventory: inventoryValue,
        inventoryQty,
        inventorySource,
        ar: arTotal,
        lines: assetLines,
        cashSource: "cash_account_ledgers",
      },
      liabilities: {
        total: totalLiabilities,
        ap: apTotal,
        apSource,
        apOpenCount,
        lines: liabilityLines,
      },
      equity: {
        total: totalEquity,
        retainedEarnings: retained,
        capitalResidual,
        lines: equityLines,
      },
      totalLiabilitiesAndEquity: liabPlusEquity,
      balanced: Math.abs(totalAssets - liabPlusEquity) < 0.02,
      difference: totalAssets - liabPlusEquity,
      equation: {
        assets: totalAssets,
        liabilitiesAndEquity: liabPlusEquity,
        difference: totalAssets - liabPlusEquity,
      },
      bridge: {
        totalAssets,
        totalLiabilities,
        netAssets,
        equityShown: totalEquity,
        gapNetAssetsVsEquity: netAssets - totalEquity,
        retainedEarningsOperational: retained,
        retainedEarningsJournalsOnly: retained,
        notes: [
          "Cash lines = Finance → Cash & bank (unique GL per till).",
          "Inventory = batch cost × remaining where batches exist, else on-hand × product cost.",
          "AP = open supplier invoice balances (no GRN-total fallback when invoices exist).",
          "Equity balancing plug holds Assets = Liabilities + Equity.",
        ],
      },
      dataSources: {
        cash: "Finance → Cash & bank ledger balances (per till GL)",
        inventory: inventorySource,
        ap: apSource,
        ar: "open sales balanceDue",
        equity: "YTD P&L residual + capital plug",
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
