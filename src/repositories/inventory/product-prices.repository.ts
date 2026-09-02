import { and, eq, ne } from "drizzle-orm";
import type { InferInsertModel } from "drizzle-orm";

import { productPrices } from "@/db/schema/inventory/product_prices";

import {
  BaseRepository,
} from "../base";

type ProductPriceInsert =
  InferInsertModel<typeof productPrices>;

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
    id: string,
    businessId: string
  ) {
    return this.database.query.productPrices.findFirst({
      where: and(
        eq(productPrices.id, id),
        eq(productPrices.businessId, businessId)
      ),

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
    businessId: string,
    data: Partial<ProductPriceInsert>
  ) {
    const [price] =
      await this.database
        .update(productPrices)
        .set(data)
        .where(
          and(
            eq(productPrices.id, id),
            eq(productPrices.businessId, businessId)
          )
        )
        .returning();

    return price;
  }

  async delete(
    id: string,
    businessId: string
  ) {
    const [price] =
      await this.database
        .delete(productPrices)
        .where(
          and(
            eq(productPrices.id, id),
            eq(productPrices.businessId, businessId)
          )
        )
        .returning();

    return price;
  }

  async deactivate(
    id: string,
    businessId: string
  ) {
    const [price] =
      await this.database
        .update(productPrices)
        .set({
          active: false,
        })
        .where(
          and(
            eq(productPrices.id, id),
            eq(productPrices.businessId, businessId)
          )
        )
        .returning();

    return price;
  }

  async exists(
    businessId: string,
    productId: string,
    priceListId: string,
    minimumQuantity: string,
    /** When updating, exclude the current row so price-only edits succeed. */
    excludeId?: string,
  ) {
    const qty = Number(minimumQuantity);
    const rows = await this.database.query.productPrices.findMany({
      where: and(
        eq(productPrices.businessId, businessId),
        eq(productPrices.productId, productId),
        eq(productPrices.priceListId, priceListId),
        excludeId ? ne(productPrices.id, excludeId) : undefined,
      ),
    });

    return rows.some((r) => Number(r.minimumQuantity) === qty);
  }
}

export const productPriceRepository =
  new ProductPriceRepository();