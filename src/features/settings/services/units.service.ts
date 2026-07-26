import { unitsRepository } from "@/repositories/settings/units.repository";

import type {
  CreateUnitInput,
  UpdateUnitInput,
} from "../schemas/unit";

class UnitsService {

  async getUnits(
    businessId: string
  ) {
    return unitsRepository.findAll(
      businessId
    );
  }

  async getUnit(
    id: string,
    businessId: string
  ) {
    const unit =
      await unitsRepository.findById(
        id,
        businessId
      );

    if (!unit) {
      throw new Error(
        "Unit not found."
      );
    }

    return unit;
  }

  async createUnit(
    data: CreateUnitInput
  ) {

    if (
      await unitsRepository.exists(
        data.code,
        data.businessId ?? ""
      )
    ) {
      throw new Error(
        "Unit code already exists."
      );
    }

    if (
      await unitsRepository.existsName(
        data.name,
        data.businessId ?? ""
      )
    ) {
      throw new Error(
        "Unit name already exists."
      );
    }

    if (
      data.symbol &&
      await unitsRepository.existsSymbol(
        data.symbol,
        data.businessId ?? ""
      )
    ) {
      throw new Error(
        "Unit symbol already exists."
      );
    }

    return unitsRepository.create(
      data
    );
  }

  async updateUnit(
    id: string,
    businessId: string,
    data: UpdateUnitInput
  ) {

    const unit =
      await unitsRepository.findById(
        id,
        businessId
      );

    if (!unit) {
      throw new Error(
        "Unit not found."
      );
    }

    // Prevent editing global units
    if (!unit.businessId) {
      throw new Error(
        "Global units cannot be modified."
      );
    }

    if (
      data.code &&
      data.code !== unit.code
    ) {
      const exists =
        await unitsRepository.exists(
          data.code,
          businessId
        );

      if (exists) {
        throw new Error(
          "Unit code already exists."
        );
      }
    }

    if (
      data.name &&
      data.name !== unit.name
    ) {
      const exists =
        await unitsRepository.existsName(
          data.name,
          businessId
        );

      if (exists) {
        throw new Error(
          "Unit name already exists."
        );
      }
    }

    if (
      data.symbol &&
      data.symbol !== unit.symbol
    ) {
      const exists =
        await unitsRepository.existsSymbol(
          data.symbol,
          businessId
        );

      if (exists) {
        throw new Error(
          "Unit symbol already exists."
        );
      }
    }

    return unitsRepository.update(
      id,
      businessId,
      data
    );
  }

  async deleteUnit(
    id: string,
    businessId: string
  ) {

    const unit =
      await unitsRepository.findById(
        id,
        businessId
      );

    if (!unit) {
      throw new Error(
        "Unit not found."
      );
    }

    // Prevent deleting global units
    if (!unit.businessId) {
      throw new Error(
        "Global units cannot be deleted."
      );
    }

    return unitsRepository.delete(
      id,
      businessId
    );
  }

}

export const unitsService =
  new UnitsService();