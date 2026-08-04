import {
  and,
  asc,
  desc,
  eq,
} from "drizzle-orm";

import { Repository } from "../base/repository";

import {
  fiscalYears,
} from "@/db/schema/settings/fiscal_years";

export interface CreateFiscalYearInput {
  businessId: string;
  code: string;
  name: string;
  startDate: string;
  endDate: string;
  isCurrent?: boolean;
  isClosed?: boolean;
  allowPosting?: boolean;
}

export interface UpdateFiscalYearInput {
  code?: string;
  name?: string;
  startDate?: string;
  endDate?: string;
  isCurrent?: boolean;
  isClosed?: boolean;
  allowPosting?: boolean;
}

class FiscalYearsRepository {

  async findAll(
    businessId: string,
  ) {
    return Repository.db.query.fiscalYears.findMany({

      where: eq(
        fiscalYears.businessId,
        businessId,
      ),

      orderBy: [
        desc(fiscalYears.startDate),
      ],

    });
  }

  async findById(
    id: string,
    businessId: string,
  ) {
    return Repository.db.query.fiscalYears.findFirst({

      where: and(

        eq(fiscalYears.id, id),

        eq(
          fiscalYears.businessId,
          businessId,
        ),

      ),

    });
  }

  async findByCode(
    code: string,
    businessId: string,
  ) {
    return Repository.db.query.fiscalYears.findFirst({

      where: and(

        eq(
          fiscalYears.businessId,
          businessId,
        ),

        eq(
          fiscalYears.code,
          code,
        ),

      ),

    });
  }

  async findCurrent(
    businessId: string,
  ) {
    return Repository.db.query.fiscalYears.findFirst({

      where: and(

        eq(
          fiscalYears.businessId,
          businessId,
        ),

        eq(
          fiscalYears.isCurrent,
          true,
        ),

      ),

    });
  }

  async exists(
    code: string,
    businessId: string,
  ) {

    const year =
      await this.findByCode(
        code,
        businessId,
      );

    return !!year;

  }

  async create(
    data: CreateFiscalYearInput,
  ) {

    const [year] =
      await Repository.db
        .insert(fiscalYears)
        .values(data)
        .returning();

    return year;

  }

  async update(
    id: string,
    businessId: string,
    data: UpdateFiscalYearInput,
  ) {

    const [year] =
      await Repository.db
        .update(fiscalYears)
        .set({

          ...data,

          updatedAt:
            new Date(),

        })
        .where(
          and(

            eq(
              fiscalYears.id,
              id,
            ),

            eq(
              fiscalYears.businessId,
              businessId,
            ),

          ),
        )
        .returning();

    return year ?? null;

  }

  async delete(
    id: string,
    businessId: string,
  ) {

    const [year] =
      await Repository.db
        .delete(fiscalYears)
        .where(
          and(

            eq(
              fiscalYears.id,
              id,
            ),

            eq(
              fiscalYears.businessId,
              businessId,
            ),

          ),
        )
        .returning();

    return year ?? null;

  }

}

export const fiscalYearsRepository =
  new FiscalYearsRepository();