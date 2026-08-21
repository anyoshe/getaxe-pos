import { asc, desc, eq, and } from "drizzle-orm";
import type { InferInsertModel } from "drizzle-orm";

import { sales } from "@/db/schema/sales/sales";
import { BaseRepository } from "../base";

type SaleInsert = InferInsertModel<typeof sales>;

export class SaleRepository extends BaseRepository {
  /**
   * Lightweight list — no relational joins (avoids failures when
   * related tables/schema lag the DB).
   */
  async findAll(businessId: string) {
    return this.database
      .select()
      .from(sales)
      .where(eq(sales.businessId, businessId))
      .orderBy(desc(sales.soldAt));
  }

  async findRecent(businessId: string, limit = 20) {
    return this.database
      .select({
        id: sales.id,
        invoiceNumber: sales.invoiceNumber,
        status: sales.status,
        paymentStatus: sales.paymentStatus,
        total: sales.total,
        soldAt: sales.soldAt,
        amountPaid: sales.amountPaid,
      })
      .from(sales)
      .where(eq(sales.businessId, businessId))
      .orderBy(desc(sales.soldAt))
      .limit(limit);
  }

  async findById(id: string) {
    // Plain select — relational `with` joins fail if relation metadata/DB lag
    const rows = await this.database
      .select()
      .from(sales)
      .where(eq(sales.id, id))
      .limit(1);
    return rows[0] ?? null;
  }

  async create(data: SaleInsert) {
    const [sale] = await this.database.insert(sales).values(data).returning();
    return sale;
  }

  async update(id: string, data: Partial<SaleInsert>) {
    const [sale] = await this.database
      .update(sales)
      .set(data)
      .where(eq(sales.id, id))
      .returning();
    return sale;
  }

  async delete(id: string) {
    const [sale] = await this.database
      .delete(sales)
      .where(eq(sales.id, id))
      .returning();
    return sale;
  }

  async findByInvoiceNumber(businessId: string, invoiceNumber: string) {
    return this.database.query.sales.findFirst({
      where: and(
        eq(sales.businessId, businessId),
        eq(sales.invoiceNumber, invoiceNumber),
      ),
    });
  }
}

export const saleRepository = new SaleRepository();
