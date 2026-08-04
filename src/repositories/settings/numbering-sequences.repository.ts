import { db } from "@/db";

import {
  and,
  asc,
  eq,
} from "drizzle-orm";

import {
  numberingSequences,
} from "@/db/schema/settings/numbering_sequences";

export interface CreateNumberingSequenceInput {

  businessId: string;

  branchId: string;

  documentType:
    | "SALE"
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

  prefix: string;

  nextNumber: number;

  numberLength: number;

  separator: string;

  resetPeriod:
    | "NEVER"
    | "YEARLY"
    | "MONTHLY"
    | "DAILY";

  active: boolean;

}

export interface UpdateNumberingSequenceInput {

  prefix?: string;

  nextNumber?: number;

  numberLength?: number;

  separator?: string;

  resetPeriod?:
    | "NEVER"
    | "YEARLY"
    | "MONTHLY"
    | "DAILY";

  active?: boolean;

}

class NumberingSequencesRepository {

  async findAll(
    businessId: string,
  ) {

    return db.query.numberingSequences.findMany({

      where: eq(
        numberingSequences.businessId,
        businessId,
      ),

      orderBy: asc(
        numberingSequences.documentType,
      ),

    });

  }

  async findByDocumentType(

    businessId: string,

    branchId: string,

    documentType: CreateNumberingSequenceInput["documentType"],

  ) {

    return db.query.numberingSequences.findFirst({

      where: and(

        eq(
          numberingSequences.businessId,
          businessId,
        ),

        eq(
          numberingSequences.branchId,
          branchId,
        ),

        eq(
          numberingSequences.documentType,
          documentType,
        ),

      ),

    });

  }

  async exists(

    businessId: string,

    branchId: string,

    documentType: CreateNumberingSequenceInput["documentType"],

  ) {

    const sequence =
      await this.findByDocumentType(

        businessId,

        branchId,

        documentType,

      );

    return !!sequence;

  }

  async create(
    data: CreateNumberingSequenceInput,
  ) {

    const [sequence] =
      await db
        .insert(numberingSequences)
        .values(data)
        .returning();

    return sequence;

  }

  async update(

    id: string,

    data: UpdateNumberingSequenceInput,

  ) {

    const [sequence] =
      await db
        .update(numberingSequences)
        .set({

          ...data,

          updatedAt: new Date(),

        })
        .where(
          eq(
            numberingSequences.id,
            id,
          ),
        )
        .returning();

    return sequence ?? null;

  }

  async delete(
    id: string,
  ) {

    const [sequence] =
      await db
        .delete(numberingSequences)
        .where(
          eq(
            numberingSequences.id,
            id,
          ),
        )
        .returning();

    return sequence ?? null;

  }

}

export const numberingSequencesRepository =
  new NumberingSequencesRepository();