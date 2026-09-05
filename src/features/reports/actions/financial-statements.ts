"use server";

import { z } from "zod";

import { requireAuthorizedUser } from "@/lib/auth/authorize";
import { financialStatementsService } from "../services/financial-statements.service";

const rangeSchema = z.object({
  fromDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  toDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

const asOfSchema = z.object({
  asOfDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

async function accountant() {
  try {
    return await requireAuthorizedUser("reports.view");
  } catch {
    try {
      return await requireAuthorizedUser("accounts.view");
    } catch {
      return await requireAuthorizedUser("finance.view");
    }
  }
}

export async function getExpenseReportAction(input: unknown) {
  const user = await accountant();
  const parsed = rangeSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false as const, message: "Invalid date range." };
  }
  try {
    const data = await financialStatementsService.expenseReport(
      user.businessId,
      parsed.data.fromDate,
      parsed.data.toDate,
    );
    return { success: true as const, data };
  } catch (e) {
    return {
      success: false as const,
      message: e instanceof Error ? e.message : "Expense report failed.",
    };
  }
}

export async function getProfitAndLossAction(input: unknown) {
  const user = await accountant();
  const parsed = rangeSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false as const, message: "Invalid date range." };
  }
  try {
    const data = await financialStatementsService.profitAndLoss(
      user.businessId,
      parsed.data.fromDate,
      parsed.data.toDate,
    );
    return { success: true as const, data };
  } catch (e) {
    return {
      success: false as const,
      message: e instanceof Error ? e.message : "P&L report failed.",
    };
  }
}

export async function getBalanceSheetAction(input: unknown) {
  const user = await accountant();
  const parsed = asOfSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false as const, message: "Invalid as-of date." };
  }
  try {
    const data = await financialStatementsService.balanceSheet(
      user.businessId,
      parsed.data.asOfDate,
    );
    return { success: true as const, data };
  } catch (e) {
    return {
      success: false as const,
      message: e instanceof Error ? e.message : "Balance sheet failed.",
    };
  }
}

export async function getAssetsLiabilitiesAction(input: unknown) {
  const user = await accountant();
  const parsed = asOfSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false as const, message: "Invalid as-of date." };
  }
  try {
    const data = await financialStatementsService.assetsAndLiabilities(
      user.businessId,
      parsed.data.asOfDate,
    );
    return { success: true as const, data };
  } catch (e) {
    return {
      success: false as const,
      message: e instanceof Error ? e.message : "Assets report failed.",
    };
  }
}
