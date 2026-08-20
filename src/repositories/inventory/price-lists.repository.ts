import { and, eq } from "drizzle-orm";
import type { InferInsertModel } from "drizzle-orm";

import { priceLists } from "@/db/schema/inventory/price_lists";

import {
  BaseRepository,
} from "../base";

type PriceListInsert =
  InferInsertModel<typeof priceLists>;

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
    id: string,
    businessId: string
  ) {
    return this.database.query.priceLists.findFirst({
      where: and(
        eq(priceLists.id, id),
        eq(priceLists.businessId, businessId)
      ),

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
    businessId: string,
    data: Partial<PriceListInsert>
  ) {
    const [priceList] =
      await this.database
        .update(priceLists)
        .set(data)
        .where(
          and(
            eq(priceLists.id, id),
            eq(priceLists.businessId, businessId)
          )
        )
        .returning();

    return priceList;
  }

  async delete(
    id: string,
    businessId: string
  ) {
    const [priceList] =
      await this.database
        .delete(priceLists)
        .where(
          and(
            eq(priceLists.id, id),
            eq(priceLists.businessId, businessId)
          )
        )
        .returning();

    return priceList;
  }

  async deactivate(
    id: string,
    businessId: string
  ) {
    const [priceList] =
      await this.database
        .update(priceLists)
        .set({
          active: false,
        })
        .where(
          and(
            eq(priceLists.id, id),
            eq(priceLists.businessId, businessId)
          )
        )
        .returning();

    return priceList;
  }

  async findDefault(businessId: string) {
    const priceList =
      await this.database.query.priceLists.findFirst({
        where: and(
          eq(priceLists.businessId, businessId),
          eq(priceLists.isDefault, true),
          eq(priceLists.active, true),
        ),
      });

    if (priceList) {
      return priceList;
    }

    // Fallback: first active price list for the business
    return this.database.query.priceLists.findFirst({
      where: and(
        eq(priceLists.businessId, businessId),
        eq(priceLists.active, true),
      ),
      orderBy: (table, { asc }) => [asc(table.name)],
    });
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
