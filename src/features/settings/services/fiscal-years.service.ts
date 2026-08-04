import {
  fiscalYearsRepository,
} from "@/repositories/settings/fiscal-years.repository";

import type {
  CreateFiscalYearInput,
  UpdateFiscalYearInput,
} from "@/repositories/settings/fiscal-years.repository";

class FiscalYearsService {

  async getFiscalYears(
    businessId: string,
  ) {
    return fiscalYearsRepository.findAll(
      businessId,
    );
  }

  async getFiscalYear(
    id: string,
    businessId: string,
  ) {

    const fiscalYear =
      await fiscalYearsRepository.findById(
        id,
        businessId,
      );

    if (!fiscalYear) {
      throw new Error(
        "Fiscal year not found.",
      );
    }

    return fiscalYear;

  }

  async getCurrentFiscalYear(
    businessId: string,
  ) {
    return fiscalYearsRepository.findCurrent(
      businessId,
    );
  }

  async createFiscalYear(
    data: CreateFiscalYearInput,
  ) {

    const exists =
      await fiscalYearsRepository.exists(
        data.code,
        data.businessId,
      );

    if (exists) {
      throw new Error(
        "Fiscal year code already exists.",
      );
    }

    return fiscalYearsRepository.create(
      data,
    );

  }

  async createCurrentFiscalYear(
  businessId: string,
) {

  const existing =
    await fiscalYearsRepository.findCurrent(
      businessId,
    );

  if (existing) {
    return existing;
  }

  const year =
    new Date().getFullYear();

  return fiscalYearsRepository.create({

    businessId,

    code: `FY${year}`,

    name: `Financial Year ${year}`,

    startDate: `${year}-01-01`,

    endDate: `${year}-12-31`,

    isCurrent: true,

    isClosed: false,

    allowPosting: true,

  });

}

  async updateFiscalYear(
    id: string,
    businessId: string,
    data: UpdateFiscalYearInput,
  ) {

    const fiscalYear =
      await fiscalYearsRepository.findById(
        id,
        businessId,
      );

    if (!fiscalYear) {
      throw new Error(
        "Fiscal year not found.",
      );
    }

    return fiscalYearsRepository.update(
      id,
      businessId,
      data,
    );

  }

  async deleteFiscalYear(
    id: string,
    businessId: string,
  ) {

    const fiscalYear =
      await fiscalYearsRepository.findById(
        id,
        businessId,
      );

    if (!fiscalYear) {
      throw new Error(
        "Fiscal year not found.",
      );
    }

    return fiscalYearsRepository.delete(
      id,
      businessId,
    );

  }

}

export const fiscalYearsService =
  new FiscalYearsService();