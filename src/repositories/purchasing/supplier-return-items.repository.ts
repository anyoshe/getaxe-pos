import {
  asc,
  eq,
} from "drizzle-orm";

import type {
  InferInsertModel,
} from "drizzle-orm";

import {
  supplierReturnItems,
} from "@/db/schema/purchasing/supplier_return_items";

import {
  BaseRepository,
} from "../base";

type SupplierReturnItemInsert =
  InferInsertModel<typeof supplierReturnItems>;

export class SupplierReturnItemRepository
  extends BaseRepository {

  async findBySupplierReturn(
    supplierReturnId: string
  ) {

    return this.database.query.supplierReturnItems.findMany({
      where: eq(
        supplierReturnItems.supplierReturnId,
        supplierReturnId
      ),

      with: {
        product: true,
        productBatch: true,
      },

      orderBy: [
        asc(supplierReturnItems.id),
      ],
    });

  }

  async findById(
    id: string
  ) {

    return this.database.query.supplierReturnItems.findFirst({
      where: eq(
        supplierReturnItems.id,
        id
      ),

      with: {
        supplierReturn: true,
        product: true,
        productBatch: true,
      },
    });

  }

  async create(
    data: SupplierReturnItemInsert
  ) {

    const [item] =
      await this.database
        .insert(supplierReturnItems)
        .values(data)
        .returning();

    return item;

  }

  async update(
    id: string,
    data: Partial<SupplierReturnItemInsert>
  ) {

    const [item] =
      await this.database
        .update(supplierReturnItems)
        .set(data)
        .where(
          eq(
            supplierReturnItems.id,
            id
          )
        )
        .returning();

    return item;

  }

  async delete(
    id: string
  ) {

    const [item] =
      await this.database
        .delete(supplierReturnItems)
        .where(
          eq(
            supplierReturnItems.id,
            id
          )
        )
        .returning();

    return item;

  }

}

export const supplierReturnItemRepository =
  new SupplierReturnItemRepository();