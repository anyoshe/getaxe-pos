import { and, eq } from "drizzle-orm";
import type { InferInsertModel } from "drizzle-orm";


import { priceLists } from "@/db/schema/inventory/price_lists";

type PriceListInsert =
  InferInsertModel<typeof priceLists>;

import {
  BaseRepository,
} from "../base";

export class PriceListRepository
  extends BaseRepository {

  async findAll(
    businessId: string
  ) {
    return this.database.query.priceLists.findMany({
      where: and(
        eq(priceLists.businessId, businessId),
        eq(priceLists.active, true)
      ),
      orderBy: (
        priceLists,
        { asc }
      ) => [asc(priceLists.name)],
    });
  }

  async findById(
    id: string
  ) {
    return this.database.query.priceLists.findFirst({
      where: eq(priceLists.id, id),

      with: {
        productPrices: true,
      },
    });
  }

  async create(
    data: PriceListInsert
  ) {
    const [priceList] =
      await this.database
        .insert(priceLists)
        .values(data)
        .returning();

    return priceList;
  }

  async update(
    id: string,
    data: Partial<PriceListInsert>
  ) {
    const [priceList] =
      await this.database
        .update(priceLists)
        .set(data)
        .where(eq(priceLists.id, id))
        .returning();

    return priceList;
  }

  async delete(
    id: string
  ) {
    const [priceList] =
      await this.database
        .delete(priceLists)
        .where(eq(priceLists.id, id))
        .returning();

    return priceList;
  }

  async deactivate(
    id: string
  ) {
    const [priceList] =
      await this.database
        .update(priceLists)
        .set({
          active: false,
        })
        .where(
          eq(priceLists.id, id)
        )
        .returning();

    return priceList;
  }

  async existsByName(
    businessId: string,
    name: string
  ) {
    if (!name) {
      return false;
    }

    const priceList =
      await this.database.query.priceLists.findFirst({
        where: and(
          eq(priceLists.businessId, businessId),
          eq(priceLists.name, name)
        ),
      });

    return !!priceList;
  }

  async existsByCode(
    businessId: string,
    code: string
  ) {
    if (!code) {
      return false;
    }

    const priceList =
      await this.database.query.priceLists.findFirst({
        where: and(
          eq(priceLists.businessId, businessId),
          eq(priceLists.code, code)
        ),
      });

    return !!priceList;
  }
}

export const priceListRepository =
  new PriceListRepository();