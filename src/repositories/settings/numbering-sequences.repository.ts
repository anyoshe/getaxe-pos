import { db } from "@/db";

import { and, asc, eq, sql } from "drizzle-orm";

import { numberingSequences } from "@/db/schema/settings/numbering_sequences";

export type NumberingDocumentType =
  | "SALE"
  | "CASH_SALE"
  | "PURCHASE_ORDER"
  | "GOODS_RECEIPT"
  | "SUPPLIER_RETURN"
  | "SALE_RETURN"
  | "PAYMENT"
  | "EXPENSE"
  | "INCOME"
  | "JOURNAL"
  | "STOCK_TRANSFER"
  | "STOCK_ADJUSTMENT";

export interface CreateNumberingSequenceInput {
  businessId: string;
  branchId: string;
  documentType: NumberingDocumentType;
  prefix: string;
  nextNumber: number;
  numberLength: number;
  separator: string;
  resetPeriod: "NEVER" | "YEARLY" | "MONTHLY" | "DAILY";
  active: boolean;
}

export interface UpdateNumberingSequenceInput {
  prefix?: string;
  nextNumber?: number;
  numberLength?: number;
  separator?: string;
  resetPeriod?: "NEVER" | "YEARLY" | "MONTHLY" | "DAILY";
  active?: boolean;
}

class NumberingSequencesRepository {
  async findAll(businessId: string) {
    return db.query.numberingSequences.findMany({
      where: eq(numberingSequences.businessId, businessId),
      orderBy: asc(numberingSequences.documentType),
    });
  }

  async findByDocumentType(
    businessId: string,
    branchId: string,
    documentType: NumberingDocumentType,
  ) {
    return db.query.numberingSequences.findFirst({
      where: and(
        eq(numberingSequences.businessId, businessId),
        eq(numberingSequences.branchId, branchId),
        eq(numberingSequences.documentType, documentType),
      ),
    });
  }

  async findAnyForDocumentType(
    businessId: string,
    documentType: NumberingDocumentType,
  ) {
    return db.query.numberingSequences.findFirst({
      where: and(
        eq(numberingSequences.businessId, businessId),
        eq(numberingSequences.documentType, documentType),
        eq(numberingSequences.active, true),
      ),
      orderBy: asc(numberingSequences.createdAt),
    });
  }

  async exists(
    businessId: string,
    branchId: string,
    documentType: NumberingDocumentType,
  ) {
    const sequence = await this.findByDocumentType(
      businessId,
      branchId,
      documentType,
    );
    return !!sequence;
  }

  async create(data: CreateNumberingSequenceInput) {
    const [sequence] = await db
      .insert(numberingSequences)
      .values(data)
      .returning();
    return sequence;
  }

  async update(id: string, data: UpdateNumberingSequenceInput) {
    const [sequence] = await db
      .update(numberingSequences)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(numberingSequences.id, id))
      .returning();
    return sequence ?? null;
  }

  async delete(id: string) {
    const [sequence] = await db
      .delete(numberingSequences)
      .where(eq(numberingSequences.id, id))
      .returning();
    return sequence ?? null;
  }

  /**
   * Atomically increment nextNumber and return the formatted number issued.
   */
  async allocateNext(sequenceId: string): Promise<{
    formatted: string;
    sequenceNumber: number;
  }> {
    const [row] = await db
      .update(numberingSequences)
      .set({
        nextNumber: sql`${numberingSequences.nextNumber} + 1`,
        updatedAt: new Date(),
      })
      .where(eq(numberingSequences.id, sequenceId))
      .returning();

    if (!row) {
      throw new Error("Numbering sequence not found.");
    }

    const issued = Number(row.nextNumber) - 1;
    const len = Math.max(1, Number(row.numberLength) || 6);
    const padded = String(Math.max(1, issued)).padStart(len, "0");
    const sep = row.separator ?? "-";
    const prefix = (row.prefix ?? "").trim();
    const formatted = prefix ? `${prefix}${sep}${padded}` : padded;

    return { formatted, sequenceNumber: issued };
  }
}

export const numberingSequencesRepository =
  new NumberingSequencesRepository();
