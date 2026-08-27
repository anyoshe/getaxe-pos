import { desc, eq } from "drizzle-orm";

import { db } from "@/db";
import { activityLogs } from "@/db/schema/infrastructure/activity_logs";

type ActivityAction =
  | "CREATE"
  | "UPDATE"
  | "DELETE"
  | "LOGIN"
  | "LOGOUT"
  | "APPROVE"
  | "REJECT"
  | "VOID"
  | "RETURN"
  | "PAY"
  | "PRINT"
  | "EXPORT";

type EntityType =
  | "BUSINESS"
  | "USER"
  | "ROLE"
  | "PRODUCT"
  | "CATEGORY"
  | "SUPPLIER"
  | "PURCHASE_ORDER"
  | "GOODS_RECEIPT"
  | "SALE"
  | "PAYMENT"
  | "CUSTOMER"
  | "PRESCRIPTION"
  | "EXPENSE"
  | "SETTING";

export type LogActivityInput = {
  businessId: string;
  userId?: string | null;
  action: ActivityAction;
  entity: EntityType;
  entityId?: string | null;
  description?: string | null;
  ipAddress?: string | null;
  userAgent?: string | null;
};

/**
 * Fire-and-forget friendly audit writer.
 * Never throws to callers — logging must not break business transactions.
 */
export async function logActivity(input: LogActivityInput): Promise<void> {
  try {
    await db.insert(activityLogs).values({
      businessId: input.businessId,
      userId: input.userId ?? null,
      action: input.action,
      entity: input.entity,
      entityId: input.entityId ?? null,
      description: input.description ?? null,
      ipAddress: input.ipAddress ?? null,
      userAgent: input.userAgent ?? null,
    });
  } catch (err) {
    console.error(
      "[audit] failed to write activity log:",
      err instanceof Error ? err.message : err,
    );
  }
}

export async function listActivityLogs(businessId: string, limit = 100) {
  return db
    .select()
    .from(activityLogs)
    .where(eq(activityLogs.businessId, businessId))
    .orderBy(desc(activityLogs.createdAt))
    .limit(limit);
}

export const activityLogService = {
  log: logActivity,
  list: listActivityLogs,
};
