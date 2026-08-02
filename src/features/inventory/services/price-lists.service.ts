import { priceListRepository } from "@/repositories/inventory";

import type { InferInsertModel } from "drizzle-orm";
import { priceLists } from "@/db/schema/inventory/price_lists";

type PriceListInsert =
  InferInsertModel<typeof priceLists>;

export class PriceListService {
  async getPriceLists(
    businessId: string
  ) {
    return priceListRepository.findAll(
      businessId
    );
  }

  async getPriceList(
    id: string
  ) {
    const priceList =
      await priceListRepository.findById(id);

    if (!priceList) {
      throw new Error(
        "Price list not found."
      );
    }

    return priceList;
  }

  async createPriceList(
    data: PriceListInsert
  ) {
    const nameExists =
      await priceListRepository.existsByName(
        data.businessId,
        data.name
      );

    if (nameExists) {
      throw new Error(
        "Price list name already exists."
      );
    }

    const codeExists =
      await priceListRepository.existsByCode(
        data.businessId,
        data.code
      );

    if (codeExists) {
      throw new Error(
        "Price list code already exists."
      );
    }

    return priceListRepository.create(
      data
    );
  }

  async updatePriceList(
    id: string,
    data: Partial<PriceListInsert>
  ) {
    const existing =
      await priceListRepository.findById(id);

    if (!existing) {
      throw new Error(
        "Price list not found."
      );
    }

    if (
      data.name &&
      data.name !== existing.name
    ) {
      const exists =
        await priceListRepository.existsByName(
          existing.businessId,
          data.name
        );

      if (exists) {
        throw new Error(
          "Price list name already exists."
        );
      }
    }

    if (
      data.code &&
      data.code !== existing.code
    ) {
      const exists =
        await priceListRepository.existsByCode(
          existing.businessId,
          data.code
        );

      if (exists) {
        throw new Error(
          "Price list code already exists."
        );
      }
    }

    return priceListRepository.update(
      id,
      data
    );
  }

  async deletePriceList(
    id: string
  ) {
    const existing =
      await priceListRepository.findById(id);

    if (!existing) {
      throw new Error(
        "Price list not found."
      );
    }

    return priceListRepository.deactivate(
      id
    );
  }
}

export const priceListService =
  new PriceListService();