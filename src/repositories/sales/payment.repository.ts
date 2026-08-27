import { and, asc, eq, sql } from "drizzle-orm";
import type { InferInsertModel } from "drizzle-orm";

import { payments } from "@/db/schema/sales/payments";
import { BaseRepository } from "../base";

type PaymentInsert = InferInsertModel<typeof payments>;

export class PaymentRepository extends BaseRepository {
  async findAll(businessId: string) {
    return this.database
      .select()
      .from(payments)
      .where(eq(payments.businessId, businessId))
      .orderBy(asc(payments.paidAt));
  }

  async findById(id: string) {
    const rows = await this.database
      .select()
      .from(payments)
      .where(eq(payments.id, id))
      .limit(1);
    return rows[0] ?? null;
  }

  async create(data: PaymentInsert) {
    // Never pass "" for uuid columns — Postgres rejects invalid uuid text
    const values: PaymentInsert = {
      ...data,
      cashAccountId: data.cashAccountId ? data.cashAccountId : null,
      transactionReference: data.transactionReference
        ? data.transactionReference
        : null,
    };

    // Omit undefined keys so drizzle doesn't bind empty strings
    if (!values.cashAccountId) {
      delete (values as { cashAccountId?: string | null }).cashAccountId;
    }
    if (!values.transactionReference) {
      delete (values as { transactionReference?: string | null })
        .transactionReference;
    }

    const [payment] = await this.database
      .insert(payments)
      .values(values)
      .returning();

    return payment;
  }

  async update(id: string, data: Partial<PaymentInsert>) {
    const [payment] = await this.database
      .update(payments)
      .set(data)
      .where(eq(payments.id, id))
      .returning();
    return payment;
  }

  async delete(id: string) {
    const [payment] = await this.database
      .delete(payments)
      .where(eq(payments.id, id))
      .returning();
    return payment;
  }

  async getTotalPaid(saleId: string) {
    const result = await this.database
      .select({
        total: sql<string>`coalesce(sum(${payments.amount}), 0)`,
      })
      .from(payments)
      .where(
        and(
          eq(payments.saleId, saleId),
          eq(payments.status, "COMPLETED"),
        ),
      );

    return Number(result[0]?.total ?? 0);
  }

  async findByReference(businessId: string, transactionReference: string) {
    return this.database.query.payments.findFirst({
      where: and(
        eq(payments.businessId, businessId),
        eq(payments.transactionReference, transactionReference),
      ),
    });
  }
}


  async findCompletedBySale(saleId: string) {
    return this.database
      .select()
      .from(payments)
      .where(
        and(
          eq(payments.saleId, saleId),
          eq(payments.status, "COMPLETED"),
        ),
      );
  }

export const paymentRepository = new PaymentRepository();
