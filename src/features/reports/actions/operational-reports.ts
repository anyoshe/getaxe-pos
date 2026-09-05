"use server";

import { z } from "zod";

import { requireAuthorizedUser } from "@/lib/auth/authorize";
import { operationalReportsService } from "../services/operational-reports.service";

const rangeSchema = z.object({
  fromDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  toDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

export async function getSalesPerformanceReportAction(input: unknown) {
  let user;
  try {
    user = await requireAuthorizedUser("reports.view");
  } catch {
    user = await requireAuthorizedUser("sales.view");
  }
  const parsed = rangeSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false as const, message: "Choose a valid from/to date." };
  }
  if (parsed.data.fromDate > parsed.data.toDate) {
    return { success: false as const, message: "From date must be before to date." };
  }
  try {
    const data = await operationalReportsService.salesPerformance(
      user.businessId,
      parsed.data.fromDate,
      parsed.data.toDate,
    );
    return { success: true as const, data };
  } catch (e) {
    return {
      success: false as const,
      message: e instanceof Error ? e.message : "Failed to load sales report.",
    };
  }
}

export async function getStockMovementsReportAction(input: unknown) {
  let user;
  try {
    user = await requireAuthorizedUser("reports.view");
  } catch {
    try {
      user = await requireAuthorizedUser("inventory.view");
    } catch {
      user = await requireAuthorizedUser("products.view");
    }
  }
  const parsed = rangeSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false as const, message: "Choose a valid from/to date." };
  }
  if (parsed.data.fromDate > parsed.data.toDate) {
    return { success: false as const, message: "From date must be before to date." };
  }
  try {
    const data = await operationalReportsService.stockMovementsReport(
      user.businessId,
      parsed.data.fromDate,
      parsed.data.toDate,
    );
    return { success: true as const, data };
  } catch (e) {
    return {
      success: false as const,
      message:
        e instanceof Error ? e.message : "Failed to load stock movement report.",
    };
  }
}
