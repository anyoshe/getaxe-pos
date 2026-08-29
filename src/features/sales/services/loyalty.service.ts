import { and, desc, eq, sql } from "drizzle-orm";

import { db } from "@/db";
import { customers } from "@/db/schema/sales/customers";
import {
  loyaltyPrograms,
  loyaltyTransactions,
} from "@/db/schema/crm/loyalty";

export class LoyaltyService {
  async getOrCreateProgram(businessId: string) {
    const [existing] = await db
      .select()
      .from(loyaltyPrograms)
      .where(eq(loyaltyPrograms.businessId, businessId))
      .limit(1);
    if (existing) return existing;

    const [created] = await db
      .insert(loyaltyPrograms)
      .values({
        businessId,
        name: "Default rewards",
        pointsPerAmount: "1",
        amountPerPointUnit: "100",
        redemptionValuePerPoint: "1",
        minRedeemPoints: 100,
        active: true,
      })
      .returning();
    return created;
  }

  async updateProgram(
    businessId: string,
    data: {
      name?: string;
      pointsPerAmount?: string;
      amountPerPointUnit?: string;
      redemptionValuePerPoint?: string;
      minRedeemPoints?: number;
      active?: boolean;
    },
  ) {
    const program = await this.getOrCreateProgram(businessId);
    const [updated] = await db
      .update(loyaltyPrograms)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(loyaltyPrograms.id, program.id))
      .returning();
    return updated;
  }

  async listTransactions(businessId: string, customerId?: string, limit = 100) {
    const where = customerId
      ? and(
          eq(loyaltyTransactions.businessId, businessId),
          eq(loyaltyTransactions.customerId, customerId),
        )
      : eq(loyaltyTransactions.businessId, businessId);

    return db
      .select()
      .from(loyaltyTransactions)
      .where(where)
      .orderBy(desc(loyaltyTransactions.createdAt))
      .limit(limit);
  }

  /**
   * Adjust points (positive = credit, negative = debit). Writes ledger + balance.
   */
  async adjustPoints(input: {
    businessId: string;
    customerId: string;
    points: number;
    type: "EARN" | "REDEEM" | "ADJUST" | "BONUS";
    reference?: string | null;
    saleId?: string | null;
    notes?: string | null;
    createdBy?: string | null;
  }) {
    if (input.points === 0) {
      throw new Error("Points change cannot be zero");
    }

    const [customer] = await db
      .select()
      .from(customers)
      .where(
        and(
          eq(customers.id, input.customerId),
          eq(customers.businessId, input.businessId),
        ),
      )
      .limit(1);

    if (!customer) throw new Error("Customer not found");

    const current = Number(customer.loyaltyPoints ?? 0);
    const next = current + input.points;
    if (next < 0) {
      throw new Error(
        `Insufficient points. Balance is ${current}; tried to change by ${input.points}.`,
      );
    }

    await db
      .update(customers)
      .set({ loyaltyPoints: next, updatedAt: new Date() })
      .where(eq(customers.id, input.customerId));

    const [tx] = await db
      .insert(loyaltyTransactions)
      .values({
        businessId: input.businessId,
        customerId: input.customerId,
        type: input.type,
        points: input.points,
        balanceAfter: next,
        reference: input.reference ?? null,
        saleId: input.saleId ?? null,
        notes: input.notes ?? null,
        createdBy: input.createdBy ?? null,
      })
      .returning();

    return { balance: next, transaction: tx };
  }

  /** Earn points for a sale total using program rules */
  async earnFromSale(input: {
    businessId: string;
    customerId: string;
    saleTotal: number;
    saleId: string;
    invoiceNumber?: string;
    createdBy?: string | null;
  }) {
    const program = await this.getOrCreateProgram(input.businessId);
    if (!program.active) return null;

    const unit = Number(program.amountPerPointUnit) || 100;
    const per = Number(program.pointsPerAmount) || 1;
    const points = Math.floor((input.saleTotal / unit) * per);
    if (points <= 0) return null;

    return this.adjustPoints({
      businessId: input.businessId,
      customerId: input.customerId,
      points,
      type: "EARN",
      saleId: input.saleId,
      reference: input.invoiceNumber ?? input.saleId,
      notes: `Earned on sale`,
      createdBy: input.createdBy,
    });
  }
}

export const loyaltyService = new LoyaltyService();
