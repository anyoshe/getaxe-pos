import { and, asc, desc, eq, isNull, or , sql} from "drizzle-orm";
import { priceLists } from "@/db/schema/inventory/price_lists";

import { db } from "@/db";
import { accountTypes } from "@/db/schema/finance/account_types";
import { accountCategories } from "@/db/schema/finance/account_categories";
import { journalEntryLines } from "@/db/schema/finance/journal_entry_lines";
import { journalEntries } from "@/db/schema/finance/journal_entries";
import { chartOfAccounts } from "@/db/schema/finance/chart_of_accounts";
import { cashAccounts } from "@/db/schema/finance/cash_accounts";
import { taxRates } from "@/db/schema/finance/tax_rates";
import { paymentMethods } from "@/db/schema/settings/payment_methods";
import { expenseCategories } from "@/db/schema/finance/expense_categories";
import { expenses } from "@/db/schema/finance/expenses";
import { incomeCategories } from "@/db/schema/finance/income_categories";
import { incomes } from "@/db/schema/finance/incomes";
import { payments } from "@/db/schema/sales/payments";
import { sales } from "@/db/schema/sales/sales";

/**
 * Ensure a minimal chart, tax, cash drawer and expense/income categories
 * so Product Wizard + POS can select real finance values.
 */
export async function ensureFinanceDefaults(businessId: string) {
  // Account types (global or business)
  const existingTypes = await db
    .select()
    .from(accountTypes)
    .where(
      or(isNull(accountTypes.businessId), eq(accountTypes.businessId, businessId)),
    )
    .limit(5);

  let typeMap: Record<string, string> = {};
  if (existingTypes.length === 0) {
    const seedTypes = [
      { code: "AST", name: "Assets", normalBalance: "DEBIT" as const, displayOrder: 1 },
      { code: "LIA", name: "Liabilities", normalBalance: "CREDIT" as const, displayOrder: 2 },
      { code: "EQT", name: "Equity", normalBalance: "CREDIT" as const, displayOrder: 3 },
      { code: "REV", name: "Revenue", normalBalance: "CREDIT" as const, displayOrder: 4 },
      { code: "EXP", name: "Expenses", normalBalance: "DEBIT" as const, displayOrder: 5 },
    ];
    for (const t of seedTypes) {
      const [row] = await db
        .insert(accountTypes)
        .values({
          businessId,
          code: t.code,
          name: t.name,
          normalBalance: t.normalBalance,
          displayOrder: t.displayOrder,
          isSystem: true,
          active: true,
        })
        .returning();
      typeMap[t.code] = row.id;
    }
  } else {
    for (const t of existingTypes) {
      typeMap[t.code] = t.id;
    }
    // load all for business
    const all = await db
      .select()
      .from(accountTypes)
      .where(
        or(isNull(accountTypes.businessId), eq(accountTypes.businessId, businessId)),
      );
    for (const t of all) typeMap[t.code] = t.id;
  }

  // Categories
  const cats = await db
    .select()
    .from(accountCategories)
    .where(
      or(
        isNull(accountCategories.businessId),
        eq(accountCategories.businessId, businessId),
      ),
    );
  let catMap: Record<string, string> = {};
  for (const c of cats) catMap[c.code] = c.id;

  const needCats = [
    { code: "CA", name: "Current Assets", type: "AST", order: 1 },
    { code: "CL", name: "Current Liabilities", type: "LIA", order: 6 },
    { code: "INV", name: "Inventory", type: "AST", order: 2 },
    { code: "REV", name: "Operating Revenue", type: "REV", order: 3 },
    { code: "COGS", name: "Cost of Sales", type: "EXP", order: 4 },
    { code: "OPEX", name: "Operating Expenses", type: "EXP", order: 5 },
    { code: "EQ", name: "Equity", type: "EQT", order: 7 },
  ];
  for (const c of needCats) {
    if (catMap[c.code]) continue;
    const typeId = typeMap[c.type];
    if (!typeId) continue;
    const [row] = await db
      .insert(accountCategories)
      .values({
        businessId,
        accountTypeId: typeId,
        code: c.code,
        name: c.name,
        displayOrder: c.order,
        isSystem: true,
        active: true,
      })
      .returning();
    catMap[c.code] = row.id;
  }

  // Chart accounts
  const accounts = await db
    .select()
    .from(chartOfAccounts)
    .where(eq(chartOfAccounts.businessId, businessId));

  const byCode = new Map(accounts.map((a) => [a.accountCode, a]));

  const needAccounts = [
    { code: "1000", name: "Cash on Hand", cat: "CA" },
    { code: "1100", name: "Bank", cat: "CA" },
    { code: "1110", name: "M-Pesa / Mobile Money", cat: "CA" },
    { code: "1120", name: "Card Clearing", cat: "CA" },
    { code: "1200", name: "Inventory Asset", cat: "INV" },
    { code: "1300", name: "Accounts Receivable", cat: "CA" },
    { code: "2000", name: "Accounts Payable", cat: "CL" },
    { code: "3000", name: "Owner Equity / Capital", cat: "EQ" },
    { code: "4000", name: "Sales Revenue", cat: "REV" },
    { code: "5000", name: "Cost of Goods Sold", cat: "COGS" },
    { code: "6000", name: "Operating Expense", cat: "OPEX" },
  ];

  for (const a of needAccounts) {
    if (byCode.has(a.code)) continue;
    const catId = catMap[a.cat];
    if (!catId) continue;
    const [row] = await db
      .insert(chartOfAccounts)
      .values({
        businessId,
        accountCategoryId: catId,
        accountCode: a.code,
        accountName: a.name,
        level: 1,
        displayOrder: 0,
        isSystem: true,
        active: true,
      })
      .returning();
    byCode.set(a.code, row);
  }

  // Tax
  const taxes = await db
    .select()
    .from(taxRates)
    .where(eq(taxRates.businessId, businessId));
  if (taxes.length === 0) {
    await db.insert(taxRates).values({
      businessId,
      code: "VAT16",
      name: "VAT 16%",
      rate: "16.00",
      active: true,
    });
    await db.insert(taxRates).values({
      businessId,
      code: "ZERO",
      name: "Zero rated",
      rate: "0.00",
      isDefault: false,
      active: true,
    });
  }

  // Cash / tender channels — each type maps to its own ledger account
  const ledgerForChannel = (type: string, name: string): string => {
    const n = name.toLowerCase();
    if (type === "CASH" || type === "PETTY_CASH") return "1000";
    if (type === "MPESA" || type === "MOBILE_MONEY") return "1110";
    if (type === "BANK" && (n.includes("card") || n.includes("terminal"))) return "1120";
    if (type === "BANK") return "1100";
    return "1000";
  };

  {
    const existingCash = await db
      .select()
      .from(cashAccounts)
      .where(eq(cashAccounts.businessId, businessId));
    const byTypeName = new Set(
      existingCash.map((a) => `${a.type}::${a.name.toLowerCase()}`),
    );
    const channels: Array<{
      name: string;
      type: "CASH" | "BANK" | "MPESA" | "MOBILE_MONEY" | "PETTY_CASH";
    }> = [
      { name: "Main Cash Drawer", type: "CASH" },
      { name: "M-Pesa Till", type: "MPESA" },
      { name: "Mobile Money", type: "MOBILE_MONEY" },
      { name: "Card Terminal", type: "BANK" },
      { name: "Bank Account", type: "BANK" },
    ];
    for (const ch of channels) {
      const key = `${ch.type}::${ch.name.toLowerCase()}`;
      if (byTypeName.has(key)) continue;
      if (ch.type === "CASH" && existingCash.some((a) => a.type === "CASH")) continue;
      if (ch.type === "MPESA" && existingCash.some((a) => a.type === "MPESA")) continue;
      if (
        ch.type === "MOBILE_MONEY" &&
        existingCash.some((a) => a.type === "MOBILE_MONEY")
      )
        continue;
      if (
        ch.name === "Card Terminal" &&
        existingCash.some(
          (a) =>
            a.name.toLowerCase().includes("card") ||
            (a.type === "BANK" && a.name.toLowerCase().includes("terminal")),
        )
      )
        continue;
      if (
        ch.name === "Bank Account" &&
        existingCash.some(
          (a) =>
            a.type === "BANK" &&
            !a.name.toLowerCase().includes("card") &&
            !a.name.toLowerCase().includes("terminal"),
        )
      )
        continue;

      const code = ledgerForChannel(ch.type, ch.name);
      const coa = byCode.get(code) ?? byCode.get("1000");
      if (!coa) continue;
      await db.insert(cashAccounts).values({
        businessId,
        accountId: coa.id,
        name: ch.name,
        type: ch.type,
        currency: "KES",
        openingBalance: "0",
        active: true,
      });
      existingCash.push({ type: ch.type, name: ch.name } as never);
      byTypeName.add(key);
    }

    // Repair: if several tills still share Cash on Hand (1000), re-link by type
    const cashOnHand = byCode.get("1000");
    if (cashOnHand) {
      const allCash = await db
        .select()
        .from(cashAccounts)
        .where(eq(cashAccounts.businessId, businessId));
      for (const row of allCash) {
        const wantCode = ledgerForChannel(String(row.type), row.name);
        const want = byCode.get(wantCode);
        if (!want) continue;
        if (row.accountId === want.id) continue;
        // Only auto-fix when currently on 1000 (mis-seeded shared ledger)
        if (row.accountId !== cashOnHand.id) continue;
        if (wantCode === "1000") continue;
        await db
          .update(cashAccounts)
          .set({ accountId: want.id, updatedAt: new Date() })
          .where(eq(cashAccounts.id, row.id));
      }
    }
  }

  // Expense / income categories
  const expCats = await db
    .select()
    .from(expenseCategories)
    .where(eq(expenseCategories.businessId, businessId));
  if (expCats.length === 0) {
    await db.insert(expenseCategories).values([
      { businessId, name: "Rent", active: true },
      { businessId, name: "Utilities", active: true },
      { businessId, name: "Salaries", active: true },
      { businessId, name: "Transport", active: true },
      { businessId, name: "Miscellaneous", active: true },
    ]);
  }

  const incCats = await db
    .select()
    .from(incomeCategories)
    .where(eq(incomeCategories.businessId, businessId));
  if (incCats.length === 0) {
    await db.insert(incomeCategories).values([
      { businessId, name: "Sales", active: true },
      { businessId, name: "Other income", active: true },
    ]);
  }


  // Default price lists (Retail + Wholesale) — required for product selling prices
  const lists = await db
    .select()
    .from(priceLists)
    .where(eq(priceLists.businessId, businessId));
  if (lists.length === 0) {
    await db.insert(priceLists).values([
      {
        businessId,
        code: "RETAIL",
        name: "Retail",
        description: "Default retail / shelf prices",
        isDefault: true,
        active: true,
      },
      {
        businessId,
        code: "WHOLESALE",
        name: "Wholesale",
        description: "Default wholesale prices",
        isDefault: false,
        active: true,
      },
    ]);
  } else if (!lists.some((l) => l.isDefault && l.active)) {
    // Ensure at least one default active list
    const first = lists.find((l) => l.active) ?? lists[0];
    if (first) {
      await db
        .update(priceLists)
        .set({ isDefault: true, active: true })
        .where(eq(priceLists.id, first.id));
    }
  }

  // Default payment methods (global or business)
  const methods = await db
    .select()
    .from(paymentMethods)
    .where(eq(paymentMethods.businessId, businessId));
  if (methods.length === 0) {
    const global = await db
      .select()
      .from(paymentMethods)
      .limit(3);
    if (global.length === 0) {
      await db.insert(paymentMethods).values([
        {
          businessId,
          code: "CASH",
          name: "Cash",
          active: true,
          isDefault: true,
        },
        {
          businessId,
          code: "MPESA",
          name: "M-Pesa",
          active: true,
          isDefault: false,
          requiresReference: true,
        },
        {
          businessId,
          code: "CARD",
          name: "Card",
          active: true,
          isDefault: false,
        },
        {
          businessId,
          code: "BANK_TRANSFER",
          name: "Bank transfer",
          active: true,
          isDefault: false,
        },
      ]);
    }
  }

  return true;
}
export class FinanceService {
  async getChartOfAccounts(businessId: string) {
    await ensureFinanceDefaults(businessId);
    return db
      .select()
      .from(chartOfAccounts)
      .where(
        and(eq(chartOfAccounts.businessId, businessId), eq(chartOfAccounts.active, true)),
      )
      .orderBy(asc(chartOfAccounts.accountCode));
  }

  async getTaxRates(businessId: string) {
    await ensureFinanceDefaults(businessId);
    return db
      .select()
      .from(taxRates)
      .where(and(eq(taxRates.businessId, businessId), eq(taxRates.active, true)))
      .orderBy(asc(taxRates.code));
  }

  async getCashAccounts(businessId: string) {
    await ensureFinanceDefaults(businessId);
    return db
      .select()
      .from(cashAccounts)
      .where(and(eq(cashAccounts.businessId, businessId), eq(cashAccounts.active, true)))
      .orderBy(asc(cashAccounts.name));
  }

  /** Resolve till/account for a POS payment method (for reconciliation). */

  /**
   * Cash & bank tills with live ledger balance:
   * openingBalance + journal debits − journal credits on the linked CoA account.
   * Sales / income increase; supplier pays & expenses decrease (when posted correctly).
   */
  async getCashAccountsWithBalances(businessId: string) {
    await ensureFinanceDefaults(businessId);
    const accounts = await db
      .select({
        id: cashAccounts.id,
        name: cashAccounts.name,
        type: cashAccounts.type,
        currency: cashAccounts.currency,
        openingBalance: cashAccounts.openingBalance,
        accountId: cashAccounts.accountId,
        accountCode: chartOfAccounts.accountCode,
        accountName: chartOfAccounts.accountName,
      })
      .from(cashAccounts)
      .innerJoin(
        chartOfAccounts,
        eq(cashAccounts.accountId, chartOfAccounts.id),
      )
      .where(
        and(eq(cashAccounts.businessId, businessId), eq(cashAccounts.active, true)),
      )
      .orderBy(asc(cashAccounts.name));

    const result = [];
    for (const a of accounts) {
      const [agg] = await db
        .select({
          debit: sql<string>`coalesce(sum(${journalEntryLines.debit}::numeric), 0)`,
          credit: sql<string>`coalesce(sum(${journalEntryLines.credit}::numeric), 0)`,
        })
        .from(journalEntryLines)
        .innerJoin(
          journalEntries,
          eq(journalEntryLines.journalEntryId, journalEntries.id),
        )
        .where(
          and(
            eq(journalEntries.businessId, businessId),
            eq(journalEntryLines.accountId, a.accountId),
          ),
        );
      const opening = Number(a.openingBalance ?? 0);
      const debit = Number(agg?.debit ?? 0);
      const credit = Number(agg?.credit ?? 0);
      // Asset: debits increase, credits decrease. Opening is already "cash in hand"
      // Journals for opening may also post — prefer opening + net journals if opening
      // journals use OPENING_BALANCE. Simpler: balance = opening + debit - credit
      // when opening journals are NOT also in lines, or opening is 0 after journal.
      // Standard: store openingBalance as seed; opening journals also hit CoA.
      // To avoid double-count, use pure ledger if any lines exist, else opening only.
      const hasLines = debit !== 0 || credit !== 0;
      const currentBalance = hasLines ? debit - credit : opening;
      // If both opening field and journals exist, ledger is authoritative (includes opening JV)
      result.push({
        ...a,
        movementIn: debit,
        movementOut: credit,
        currentBalance,
      });
    }
    return result;
  }

  async getCashAccountGlCode(
    businessId: string,
    cashAccountId: string | null | undefined,
  ): Promise<string | null> {
    if (!cashAccountId) return null;
    const [row] = await db
      .select({ accountCode: chartOfAccounts.accountCode })
      .from(cashAccounts)
      .innerJoin(
        chartOfAccounts,
        eq(cashAccounts.accountId, chartOfAccounts.id),
      )
      .where(
        and(
          eq(cashAccounts.id, cashAccountId),
          eq(cashAccounts.businessId, businessId),
        ),
      )
      .limit(1);
    return row?.accountCode ?? null;
  }


  async resolveCashAccountIdForMethod(
    businessId: string,
    method: string,
  ): Promise<string | null> {
    await ensureFinanceDefaults(businessId);
    const accounts = await this.getCashAccounts(businessId);
    const m = method.toUpperCase();
    const pick = (
      pred: (a: (typeof accounts)[number]) => boolean,
    ) => accounts.find(pred)?.id ?? null;

    if (m === "CASH") {
      return pick((a) => a.type === "CASH") ?? pick((a) => a.type === "PETTY_CASH");
    }
    if (m === "MPESA") {
      return pick((a) => a.type === "MPESA");
    }
    if (m === "MOBILE_MONEY") {
      return pick((a) => a.type === "MOBILE_MONEY") ?? pick((a) => a.type === "MPESA");
    }
    if (m === "CARD") {
      return (
        pick(
          (a) =>
            a.type === "BANK" && a.name.toLowerCase().includes("card"),
        ) ?? pick((a) => a.type === "BANK")
      );
    }
    if (m === "BANK_TRANSFER" || m === "CHEQUE") {
      return pick(
        (a) =>
          a.type === "BANK" && !a.name.toLowerCase().includes("card"),
      );
    }
    return pick((a) => a.type === "CASH");
  }

  async getDefaultCashAccount(businessId: string) {
    const rows = await this.getCashAccounts(businessId);
    return rows.find((r) => r.type === "CASH") ?? rows[0] ?? null;
  }

  async getExpenseCategories(businessId: string) {
    await ensureFinanceDefaults(businessId);
    return db
      .select()
      .from(expenseCategories)
      .where(
        and(
          eq(expenseCategories.businessId, businessId),
          eq(expenseCategories.active, true),
        ),
      )
      .orderBy(asc(expenseCategories.name));
  }

  async getExpenses(businessId: string) {
    return db
      .select()
      .from(expenses)
      .where(eq(expenses.businessId, businessId))
      .orderBy(desc(expenses.expenseDate))
      .limit(100);
  }

  async getIncomeCategories(businessId: string) {
    await ensureFinanceDefaults(businessId);
    return db
      .select()
      .from(incomeCategories)
      .where(
        and(
          eq(incomeCategories.businessId, businessId),
          eq(incomeCategories.active, true),
        ),
      )
      .orderBy(asc(incomeCategories.name));
  }

  async getIncomes(businessId: string) {
    return db
      .select()
      .from(incomes)
      .where(eq(incomes.businessId, businessId))
      .orderBy(desc(incomes.incomeDate))
      .limit(100);
  }

  async getPayments(businessId: string) {
    return db
      .select({
        id: payments.id,
        amount: payments.amount,
        method: payments.method,
        status: payments.status,
        paidAt: payments.paidAt,
        saleId: payments.saleId,
        invoiceNumber: sales.invoiceNumber,
        cashAccountId: payments.cashAccountId,
      })
      .from(payments)
      .leftJoin(sales, eq(payments.saleId, sales.id))
      .where(eq(payments.businessId, businessId))
      .orderBy(desc(payments.paidAt))
      .limit(100);
  }

  /** Accounts filtered for product wizard */
  async getAccountsForProductContext(businessId: string) {
    await ensureFinanceDefaults(businessId);
    const accounts = await this.getChartOfAccounts(businessId);
    const incomeAccounts = accounts.filter(
      (a) =>
        a.accountCode.startsWith("4") ||
        a.accountName.toLowerCase().includes("revenue") ||
        a.accountName.toLowerCase().includes("sales"),
    );
    const expenseAccounts = accounts.filter(
      (a) =>
        a.accountCode.startsWith("5") ||
        a.accountCode.startsWith("6") ||
        a.accountName.toLowerCase().includes("cost") ||
        a.accountName.toLowerCase().includes("expense"),
    );
    const inventoryAccounts = accounts.filter(
      (a) =>
        a.accountCode.startsWith("12") ||
        a.accountName.toLowerCase().includes("inventory"),
    );
    return {
      incomeAccounts: incomeAccounts.length ? incomeAccounts : accounts,
      expenseAccounts: expenseAccounts.length ? expenseAccounts : accounts,
      inventoryAccounts: inventoryAccounts.length ? inventoryAccounts : accounts,
    };
  }
}

export const financeService = new FinanceService();
