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
        await journalPostingService.postExpense({
          businessId: user.businessId,
          expenseId: row.id,
          amount: parsed.data.amount,
          description: parsed.data.description,
          postedBy: user.id,
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
        await journalPostingService.postIncome({
          businessId: user.businessId,
          incomeId: row.id,
          amount: parsed.data.amount,
          description: parsed.data.description,
          postedBy: user.id,
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
    revalidatePath("/inventory/products");
    return { success: true as const, message: "Account created." };
  } catch (e) {
    return {
      success: false as const,
      message: e instanceof Error ? e.message : "Failed to create account.",
    };
  }
}
