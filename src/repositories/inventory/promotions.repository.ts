import { and, desc, eq, inArray, isNull, lte, or, gte, sql } from "drizzle-orm";

import { db } from "@/db";
import { promotionProducts, promotions } from "@/db/schema";

export class PromotionsRepository {
  async list(businessId: string) {
    return db
      .select()
      .from(promotions)
      .where(eq(promotions.businessId, businessId))
      .orderBy(desc(promotions.createdAt));
  }

  async findById(id: string, businessId: string) {
    const [row] = await db
      .select()
      .from(promotions)
      .where(and(eq(promotions.id, id), eq(promotions.businessId, businessId)))
      .limit(1);
    return row ?? null;
  }

  async listProductIds(promotionId: string) {
    const rows = await db
      .select({ productId: promotionProducts.productId })
      .from(promotionProducts)
      .where(eq(promotionProducts.promotionId, promotionId));
    return rows.map((r) => r.productId);
  }

  /** Active promos valid now (date window), for POS. */
  async listActiveForPos(businessId: string) {
    const now = new Date();
    const rows = await db
      .select()
      .from(promotions)
      .where(
        and(
          eq(promotions.businessId, businessId),
          eq(promotions.active, true),
          or(isNull(promotions.startsAt), lte(promotions.startsAt, now)),
          or(isNull(promotions.endsAt), gte(promotions.endsAt, now)),
        ),
      )
      .orderBy(desc(promotions.createdAt));

    const result: Array<{
      id: string;
      name: string;
      discountType: string;
      discountValue: number;
      scope: string;
      productIds: string[];
    }> = [];

    for (const p of rows) {
      const productIds =
        p.scope === "SELECTED"
          ? await this.listProductIds(p.id)
          : [];
      result.push({
        id: p.id,
        name: p.name,
        discountType: p.discountType,
        discountValue: Number(p.discountValue),
        scope: p.scope,
        productIds,
      });
    }
    return result;
  }

  async create(data: {
    businessId: string;
    code: string;
    name: string;
    description?: string | null;
    discountType: string;
    discountValue: string;
    startsAt?: Date | null;
    endsAt?: Date | null;
    scope: string;
    active?: boolean;
    productIds?: string[];
  }) {
    return db.transaction(async (tx) => {
      const [row] = await tx
        .insert(promotions)
        .values({
          businessId: data.businessId,
          code: data.code.trim().toUpperCase(),
          name: data.name.trim(),
          description: data.description ?? null,
          discountType: data.discountType,
          discountValue: data.discountValue,
          startsAt: data.startsAt ?? null,
          endsAt: data.endsAt ?? null,
          scope: data.scope,
          active: data.active ?? true,
        })
        .returning();

      if (data.scope === "SELECTED" && data.productIds?.length) {
        await tx.insert(promotionProducts).values(
          data.productIds.map((productId) => ({
            businessId: data.businessId,
            promotionId: row.id,
            productId,
          })),
        );
      }
      return row;
    });
  }

  async update(
    id: string,
    businessId: string,
    data: {
      name?: string;
      description?: string | null;
      discountType?: string;
      discountValue?: string;
      startsAt?: Date | null;
      endsAt?: Date | null;
      scope?: string;
      active?: boolean;
      productIds?: string[];
    },
  ) {
    return db.transaction(async (tx) => {
      const [row] = await tx
        .update(promotions)
        .set({
          name: data.name,
          description: data.description,
          discountType: data.discountType,
          discountValue: data.discountValue,
          startsAt: data.startsAt,
          endsAt: data.endsAt,
          scope: data.scope,
          active: data.active,
          updatedAt: new Date(),
        })
        .where(and(eq(promotions.id, id), eq(promotions.businessId, businessId)))
        .returning();

      if (data.productIds && data.scope === "SELECTED") {
        await tx
          .delete(promotionProducts)
          .where(eq(promotionProducts.promotionId, id));
        if (data.productIds.length) {
          await tx.insert(promotionProducts).values(
            data.productIds.map((productId) => ({
              businessId,
              promotionId: id,
              productId,
            })),
          );
        }
      }
      if (data.scope === "ALL") {
        await tx
          .delete(promotionProducts)
          .where(eq(promotionProducts.promotionId, id));
      }
      return row ?? null;
    });
  }

  async setActive(id: string, businessId: string, active: boolean) {
    const [row] = await db
      .update(promotions)
      .set({ active, updatedAt: new Date() })
      .where(and(eq(promotions.id, id), eq(promotions.businessId, businessId)))
      .returning();
    return row ?? null;
  }
}

export const promotionsRepository = new PromotionsRepository();
