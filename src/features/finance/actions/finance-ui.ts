"use server";

import { nowNairobiWallClock } from "@/lib/timezone";

import { journalPostingService } from "@/features/finance/services/journal-posting.service";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireAuthorizedUser } from "@/lib/auth/authorize";
import { db } from "@/db";
import { taxRates } from "@/db/schema/finance/tax_rates";
import { expenses } from "@/db/schema/finance/expenses";
import { incomes } from "@/db/schema/finance/incomes";
import { expenseCategories } from "@/db/schema/finance/expense_categories";
import { incomeCategories } from "@/db/schema/finance/income_categories";
import { and, eq, sql } from "drizzle-orm";
import { cashAccounts } from "@/db/schema/finance/cash_accounts";
import { chartOfAccounts } from "@/db/schema/finance/chart_of_accounts";
import { financeService } from "../services/finance.service";

export async function ensureFinanceDefaultsAction() {
  const user = await requireAuthorizedUser("accounts.view");
  await financeService.getChartOfAccounts(user.businessId);
  return { success: true as const };
}

export async function createTaxRateAction(input: unknown) {
  const user = await requireAuthorizedUser("accounts.update");
  const parsed = z
    .object({
      code: z.string().min(1),
      name: z.string().min(1),
      rate: z.coerce.number().min(0).max(100),
      isDefault: z.boolean().optional(),
    })
    .safeParse(input);
  if (!parsed.success) {
    return { success: false as const, message: "Invalid tax rate." };
  }
  try {
    await db.insert(taxRates).values({
      businessId: user.businessId,
      code: parsed.data.code.toUpperCase(),
      name: parsed.data.name,
      rate: parsed.data.rate.toFixed(2),
      isDefault: parsed.data.isDefault ?? false,
      active: true,
    });
    revalidatePath("/finance/tax-rates");
    revalidatePath("/inventory/products");
    return { success: true as const, message: "Tax rate created." };
  } catch (e) {
    return {
      success: false as const,
      message: e instanceof Error ? e.message : "Failed to create tax rate.",
    };
  }
}


export async function createExpenseCategoryAction(input: unknown) {
  const user = await requireAuthorizedUser("accounts.update");
  const parsed = z
    .object({
      name: z.string().trim().min(1, "Category name is required").max(120),
      description: z.string().trim().max(500).optional().nullable(),
    })
    .safeParse(input);
  if (!parsed.success) {
    return { success: false as const, message: "Enter a category name." };
  }
  const name = parsed.data.name;
  try {
    const existingRows = await db
      .select()
      .from(expenseCategories)
      .where(eq(expenseCategories.businessId, user.businessId));
    const existing = existingRows.find(
      (r) => r.name.trim().toLowerCase() === name.toLowerCase(),
    );
    if (existing) {
      if (!existing.active) {
        await db
          .update(expenseCategories)
          .set({ active: true, updatedAt: new Date() })
          .where(eq(expenseCategories.id, existing.id));
      }
      revalidatePath("/finance/expenses");
      return {
        success: true as const,
        message: "Category already existed — selected.",
        id: existing.id,
        name: existing.name,
      };
    }
    const [row] = await db
      .insert(expenseCategories)
      .values({
        businessId: user.businessId,
        name,
        description: parsed.data.description ?? null,
        active: true,
      })
      .returning();
    revalidatePath("/finance/expenses");
    return {
      success: true as const,
      message: "Expense category created.",
      id: row.id,
      name: row.name,
    };
  } catch (e) {
    return {
      success: false as const,
      message: e instanceof Error ? e.message : "Could not create category.",
    };
  }
}

export async function createIncomeCategoryAction(input: unknown) {
  const user = await requireAuthorizedUser("accounts.update");
  const parsed = z
    .object({
      name: z.string().trim().min(1, "Category name is required").max(120),
      description: z.string().trim().max(500).optional().nullable(),
    })
    .safeParse(input);
  if (!parsed.success) {
    return { success: false as const, message: "Enter a category name." };
  }
  const name = parsed.data.name;
  try {
    const existingRows = await db
      .select()
      .from(incomeCategories)
      .where(eq(incomeCategories.businessId, user.businessId));
    const existing = existingRows.find(
      (r) => r.name.trim().toLowerCase() === name.toLowerCase(),
    );
    if (existing) {
      if (!existing.active) {
        await db
          .update(incomeCategories)
          .set({ active: true, updatedAt: new Date() })
          .where(eq(incomeCategories.id, existing.id));
      }
      revalidatePath("/finance/incomes");
      return {
        success: true as const,
        message: "Category already existed — selected.",
        id: existing.id,
        name: existing.name,
      };
    }
    const [row] = await db
      .insert(incomeCategories)
      .values({
        businessId: user.businessId,
        name,
        description: parsed.data.description ?? null,
        active: true,
      })
      .returning();
    revalidatePath("/finance/incomes");
    return {
      success: true as const,
      message: "Income category created.",
      id: row.id,
      name: row.name,
    };
  } catch (e) {
    return {
      success: false as const,
      message: e instanceof Error ? e.message : "Could not create category.",
    };
  }
}

export async function createExpenseAction(input: unknown) {
  const user = await requireAuthorizedUser("accounts.update");
  const parsed = z
    .object({
      categoryId: z.uuid(),
      cashAccountId: z.uuid().nullable().optional(),
      description: z.string().min(1),
      amount: z.coerce.number().positive(),
      paidTo: z.string().nullable().optional(),
      reference: z.string().nullable().optional(),
    })
    .safeParse(input);
  if (!parsed.success) {
    return { success: false as const, message: "Check expense details." };
  }
  try {
    const [row] = await db
      .insert(expenses)
      .values({
        businessId: user.businessId,
        categoryId: parsed.data.categoryId,
        cashAccountId: parsed.data.cashAccountId ?? null,
        description: parsed.data.description,
        amount: parsed.data.amount.toFixed(2),
        paidTo: parsed.data.paidTo ?? null,
        reference: parsed.data.reference ?? null,
        status: "PAID",
        createdBy: user.id,
        expenseDate: nowNairobiWallClock(),
        createdAt: nowNairobiWallClock(),
      })
      .returning();

    try {
      if (row) {
        const cashCode = await financeService.getCashAccountGlCode(
          user.businessId,
          parsed.data.cashAccountId,
        );
        await journalPostingService.postExpense({
          businessId: user.businessId,
          expenseId: row.id,
          amount: parsed.data.amount,
          description: parsed.data.description,
          postedBy: user.id,
          cashAccountCode: cashCode ?? undefined,
        });
      }
    } catch (je) {
      console.error("[createExpense] journal", je);
    }

    revalidatePath("/finance/expenses");
    revalidatePath("/reports/finance");
    return { success: true as const, message: "Expense recorded." };
  } catch (e) {
    return {
      success: false as const,
      message: e instanceof Error ? e.message : "Failed to record expense.",
    };
  }
}

export async function createIncomeAction(input: unknown) {
  const user = await requireAuthorizedUser("accounts.update");
  const parsed = z
    .object({
      categoryId: z.uuid(),
      cashAccountId: z.uuid().nullable().optional(),
      description: z.string().min(1),
      amount: z.coerce.number().positive(),
      receivedFrom: z.string().nullable().optional(),
      reference: z.string().nullable().optional(),
    })
    .safeParse(input);
  if (!parsed.success) {
    return { success: false as const, message: "Check income details." };
  }
  try {
    const [row] = await db
      .insert(incomes)
      .values({
        businessId: user.businessId,
        categoryId: parsed.data.categoryId,
        cashAccountId: parsed.data.cashAccountId ?? null,
        description: parsed.data.description,
        amount: parsed.data.amount.toFixed(2),
        receivedFrom: parsed.data.receivedFrom ?? null,
        reference: parsed.data.reference ?? null,
        receivedBy: user.id,
        status: "COMPLETED",
      })
      .returning();
    try {
      if (row) {
        const cashCode = await financeService.getCashAccountGlCode(
          user.businessId,
          parsed.data.cashAccountId,
        );
        await journalPostingService.postIncome({
          businessId: user.businessId,
          incomeId: row.id,
          amount: parsed.data.amount,
          description: parsed.data.description,
          postedBy: user.id,
          cashAccountCode: cashCode ?? undefined,
        });
      }
    } catch (je) {
      console.error("[createIncome] journal", je);
    }
    revalidatePath("/finance/incomes");
    revalidatePath("/reports/finance");
    return { success: true as const, message: "Income recorded." };
  } catch (e) {
    return {
      success: false as const,
      message: e instanceof Error ? e.message : "Failed to record income.",
    };
  }
}

export async function createCashAccountAction(input: unknown) {
  const user = await requireAuthorizedUser("accounts.update");
  const parsed = z
    .object({
      name: z.string().min(1),
      type: z.enum(["CASH", "BANK", "MPESA", "MOBILE_MONEY", "PETTY_CASH"]),
      accountId: z.uuid(),
      bankName: z.string().nullable().optional(),
      accountNumber: z.string().nullable().optional(),
      branchName: z.string().nullable().optional(),
    })
    .safeParse(input);
  if (!parsed.success) {
    return { success: false as const, message: "Check cash account details." };
  }
  try {
    await db.insert(cashAccounts).values({
      businessId: user.businessId,
      name: parsed.data.name,
      type: parsed.data.type,
      accountId: parsed.data.accountId,
      bankName: parsed.data.bankName ?? null,
      accountNumber: parsed.data.accountNumber ?? null,
      branchName: parsed.data.branchName ?? null,
      currency: "KES",
      openingBalance: "0",
      active: true,
    });
    revalidatePath("/finance/cash-accounts");
    return { success: true as const, message: "Cash account created." };
  } catch (e) {
    return {
      success: false as const,
      message: e instanceof Error ? e.message : "Failed to create cash account.",
    };
  }
}


export async function deactivateCashAccountAction(input: unknown) {
  const user = await requireAuthorizedUser("accounts.update");
  const parsed = z.object({ id: z.uuid() }).safeParse(input);
  if (!parsed.success) {
    return { success: false as const, message: "Invalid cash account." };
  }
  try {
    const { eq, and } = await import("drizzle-orm");
    const updated = await db
      .update(cashAccounts)
      .set({ active: false, updatedAt: new Date() })
      .where(
        and(
          eq(cashAccounts.id, parsed.data.id),
          eq(cashAccounts.businessId, user.businessId),
        ),
      )
      .returning({ id: cashAccounts.id });
    if (!updated.length) {
      return { success: false as const, message: "Cash account not found." };
    }
    revalidatePath("/finance/cash-accounts");
    revalidatePath("/finance/opening-balances");
    revalidatePath("/sales/pos");
    return {
      success: true as const,
      message: "Cash account removed from the active list. Ledger history is kept.",
    };
  } catch (e) {
    return {
      success: false as const,
      message: e instanceof Error ? e.message : "Failed to remove cash account.",
    };
  }
}

export async function updateCashAccountDetailsAction(input: unknown) {
  const user = await requireAuthorizedUser("accounts.update");
  const parsed = z
    .object({
      id: z.uuid(),
      name: z.string().min(1).optional(),
      type: z
        .enum(["CASH", "BANK", "MPESA", "MOBILE_MONEY", "PETTY_CASH"])
        .optional(),
      accountId: z.uuid().optional(),
      bankName: z.string().nullable().optional(),
      accountNumber: z.string().nullable().optional(),
      branchName: z.string().nullable().optional(),
    })
    .safeParse(input);
  if (!parsed.success) {
    return { success: false as const, message: "Check account details." };
  }
  try {
    const { eq, and } = await import("drizzle-orm");
    const patch: Record<string, unknown> = { updatedAt: new Date() };
    if (parsed.data.name != null) patch.name = parsed.data.name;
    if (parsed.data.type != null) patch.type = parsed.data.type;
    if (parsed.data.accountId != null) patch.accountId = parsed.data.accountId;
    if (parsed.data.bankName !== undefined) patch.bankName = parsed.data.bankName;
    if (parsed.data.accountNumber !== undefined)
      patch.accountNumber = parsed.data.accountNumber;
    if (parsed.data.branchName !== undefined)
      patch.branchName = parsed.data.branchName;
    const updated = await db
      .update(cashAccounts)
      .set(patch)
      .where(
        and(
          eq(cashAccounts.id, parsed.data.id),
          eq(cashAccounts.businessId, user.businessId),
        ),
      )
      .returning({ id: cashAccounts.id });
    if (!updated.length) {
      return { success: false as const, message: "Cash account not found." };
    }
    revalidatePath("/finance/cash-accounts");
    revalidatePath("/sales/pos");
    return { success: true as const, message: "Cash account updated." };
  } catch (e) {
    return {
      success: false as const,
      message: e instanceof Error ? e.message : "Failed to update.",
    };
  }
}


export async function updateChartAccountAction(input: unknown) {
  const user = await requireAuthorizedUser("accounts.update");
  const parsed = z
    .object({
      id: z.uuid(),
      accountCode: z.string().min(1).optional(),
      accountName: z.string().min(1).optional(),
      description: z.string().nullable().optional(),
      accountCategoryId: z.uuid().optional(),
    })
    .safeParse(input);
  if (!parsed.success) {
    return { success: false as const, message: "Check account details." };
  }
  try {
    const { eq, and } = await import("drizzle-orm");
    const existing = await db
      .select()
      .from(chartOfAccounts)
      .where(
        and(
          eq(chartOfAccounts.id, parsed.data.id),
          eq(chartOfAccounts.businessId, user.businessId),
        ),
      )
      .limit(1);
    if (!existing[0]) {
      return { success: false as const, message: "Account not found." };
    }
    const row = existing[0];
    const patch: Record<string, unknown> = { updatedAt: new Date() };
    if (parsed.data.accountName != null) patch.accountName = parsed.data.accountName;
    if (parsed.data.description !== undefined)
      patch.description = parsed.data.description;
    if (parsed.data.accountCategoryId != null)
      patch.accountCategoryId = parsed.data.accountCategoryId;
    // System accounts keep stable codes used by journals / readiness
    if (!row.isSystem && parsed.data.accountCode != null) {
      patch.accountCode = parsed.data.accountCode.trim();
    }
    await db
      .update(chartOfAccounts)
      .set(patch)
      .where(
        and(
          eq(chartOfAccounts.id, parsed.data.id),
          eq(chartOfAccounts.businessId, user.businessId),
        ),
      );
    revalidatePath("/finance/accounts");
    revalidatePath("/finance/cash-accounts");
    return { success: true as const, message: "Account updated." };
  } catch (e) {
    return {
      success: false as const,
      message: e instanceof Error ? e.message : "Failed to update account.",
    };
  }
}

export async function createChartAccountAction(input: unknown) {
  const user = await requireAuthorizedUser("accounts.update");
  const parsed = z
    .object({
      accountCode: z.string().min(1),
      accountName: z.string().min(1),
      accountCategoryId: z.uuid(),
      description: z.string().nullable().optional(),
    })
    .safeParse(input);
  if (!parsed.success) {
    return { success: false as const, message: "Check account details." };
  }
  try {
    await db.insert(chartOfAccounts).values({
      businessId: user.businessId,
      accountCode: parsed.data.accountCode,
      accountName: parsed.data.accountName,
      accountCategoryId: parsed.data.accountCategoryId,
      description: parsed.data.description ?? null,
      level: 1,
      displayOrder: 0,
      isSystem: false,
      active: true,
    });
    revalidatePath("/finance/accounts");
    revalidatePath("/finance/cash-accounts");
    revalidatePath("/inventory/products");
    return { success: true as const, message: "Account created." };
  } catch (e) {
    return {
      success: false as const,
      message: e instanceof Error ? e.message : "Failed to create account.",
    };
  }
}

/** --- Recurring monthly fixed costs --- */

const recurringSchema = z.object({
  categoryId: z.string().uuid(),
  name: z.string().trim().min(2),
  amount: z.coerce.number().positive(),
  dayOfMonth: z.coerce.number().int().min(1).max(28),
  notes: z.string().optional(),
});

export async function createRecurringExpenseAction(input: {
  categoryId: string;
  name: string;
  amount: number | string;
  dayOfMonth: number | string;
  notes?: string;
}) {
  const user = await requireAuthorizedUser("accounts.update");
  const parsed = recurringSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false as const, message: "Check name, amount, and due day (1–28)." };
  }
  try {
    const { createRecurringExpense } = await import(
      "@/features/finance/services/recurring-expenses.service"
    );
    await createRecurringExpense({
      businessId: user.businessId,
      categoryId: parsed.data.categoryId,
      name: parsed.data.name,
      amount: parsed.data.amount,
      dayOfMonth: parsed.data.dayOfMonth,
      notes: parsed.data.notes,
      createdBy: user.id,
    });
    revalidatePath("/finance/expenses");
    revalidatePath("/dashboard");
    revalidatePath("/dashboard/attention");
    return { success: true as const, message: "Monthly fixed cost saved." };
  } catch (e) {
    const raw = e instanceof Error ? e.message : String(e);
    const missingTable =
      /recurring_expenses/i.test(raw) &&
      (/does not exist|relation/i.test(raw) || /Failed query/i.test(raw));
    return {
      success: false as const,
      message: missingTable
        ? "Database is missing the recurring_expenses table. Run: pnpm db:migrate (apply 0045_recurring_expenses.sql) against this environment’s DATABASE_URL, then try again."
        : raw || "Failed to save recurring expense.",
    };
  }
}

export async function setRecurringExpenseActiveAction(id: string, active: boolean) {
  const user = await requireAuthorizedUser("accounts.update");
  try {
    const { setRecurringExpenseActive } = await import(
      "@/features/finance/services/recurring-expenses.service"
    );
    await setRecurringExpenseActive(user.businessId, id, active);
    revalidatePath("/finance/expenses");
    revalidatePath("/dashboard");
    revalidatePath("/dashboard/attention");
    return { success: true as const, message: active ? "Reactivated." : "Paused." };
  } catch (e) {
    return {
      success: false as const,
      message: e instanceof Error ? e.message : "Failed to update.",
    };
  }
}
