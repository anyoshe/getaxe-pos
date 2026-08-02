import {
  and,
  asc,
  eq,
} from "drizzle-orm";

import type {
  InferInsertModel,
} from "drizzle-orm";

import {
  supplierReturns,
} from "@/db/schema/purchasing/supplier_returns";

import {
  BaseRepository,
} from "../base";

type SupplierReturnInsert =
  InferInsertModel<typeof supplierReturns>;

export class SupplierReturnRepository
  extends BaseRepository {

  async findAll(
    businessId: string
  ) {

    return this.database.query.supplierReturns.findMany({
      where: eq(
        supplierReturns.businessId,
        businessId
      ),

      with: {
        supplier: true,
        createdBy: true,
      },

      orderBy: [
        asc(
          supplierReturns.returnNumber
        ),
      ],
    });

  }

  async findById(
    id: string
  ) {

    return this.database.query.supplierReturns.findFirst({
      where: eq(
        supplierReturns.id,
        id
      ),

      with: {
        supplier: true,
        createdBy: true,
        items: true,
      },
    });

  }

  async create(
    data: SupplierReturnInsert
  ) {

    const [supplierReturn] =
      await this.database
        .insert(supplierReturns)
        .values(data)
        .returning();

    return supplierReturn;

  }

  async update(
    id: string,
    data: Partial<SupplierReturnInsert>
  ) {

    const [supplierReturn] =
      await this.database
        .update(supplierReturns)
        .set(data)
        .where(
          eq(
            supplierReturns.id,
            id
          )
        )
        .returning();

    return supplierReturn;

  }

  async delete(
    id: string
  ) {

    const [supplierReturn] =
      await this.database
        .delete(supplierReturns)
        .where(
          eq(
            supplierReturns.id,
            id
          )
        )
        .returning();

    return supplierReturn;

  }

  async findByReturnNumber(
    businessId: string,
    returnNumber: string
  ) {

    return this.database.query.supplierReturns.findFirst({
      where: and(
        eq(
          supplierReturns.businessId,
          businessId
        ),
        eq(
          supplierReturns.returnNumber,
          returnNumber
        )
      ),

      with: {
        supplier: true,
      },
    });

  }

}

export const supplierReturnRepository =
  new SupplierReturnRepository();