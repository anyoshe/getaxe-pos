import { and, eq } from "drizzle-orm";
import type { InferInsertModel } from "drizzle-orm";


import { productPrices } from "@/db/schema/inventory/product_prices";

type ProductPriceInsert =
  InferInsertModel<typeof productPrices>;

import {
  BaseRepository,
} from "../base";

export class ProductPriceRepository
  extends BaseRepository {
  async findAll(
    businessId: string
  ) {
    return this.database.query.productPrices.findMany({
      where: and(
        eq(productPrices.businessId, businessId),
        eq(productPrices.active, true)
      ),

      with: {
        product: true,
        priceList: true,
      },

      orderBy: (
        productPrices,
        { asc }
      ) => [
          asc(productPrices.productId),
          asc(productPrices.minimumQuantity),
        ],
    });
  }

  async findById(
    id: string
  ) {
    return this.database.query.productPrices.findFirst({
      where: eq(productPrices.id, id),

      with: {
        product: true,
        priceList: true,
      },
    });
  }

  async create(
    data: ProductPriceInsert
  ) {
    const [price] =
      await this.database
        .insert(productPrices)
        .values(data)
        .returning();

    return price;
  }

  async update(
    id: string,
    data: Partial<ProductPriceInsert>
  ) {
    const [price] =
      await this.database
        .update(productPrices)
        .set(data)
        .where(eq(productPrices.id, id))
        .returning();

    return price;
  }

  async delete(
    id: string
  ) {
    const [price] =
      await this.database
        .delete(productPrices)
        .where(eq(productPrices.id, id))
        .returning();

    return price;
  }

  async deactivate(
    id: string
  ) {
    const [price] =
      await this.database
        .update(productPrices)
        .set({
          active: false,
        })
        .where(
          eq(productPrices.id, id)
        )
        .returning();

    return price;
  }

  async exists(
    businessId: string,
    productId: string,
    priceListId: string,
    minimumQuantity: string
  ) {
    const record =
      await this.database.query.productPrices.findFirst({
        where: and(
          eq(productPrices.businessId, businessId),
          eq(productPrices.productId, productId),
          eq(productPrices.priceListId, priceListId),
          eq(
            productPrices.minimumQuantity,
            minimumQuantity
          )
        ),
      });

    return !!record;
  }
}

export const productPriceRepository =
  new ProductPriceRepository();