import {
  and,
  asc,
  eq,
  isNull,
  or,
} from "drizzle-orm";

import { db } from "@/db";

import {
  units,
} from "@/db/schema/settings/units";

export interface CreateUnitInput {
  businessId?: string | null;

  code: string;

  name: string;

  symbol?: string | null;

  description?: string | null;

  active?: boolean;
}

export interface UpdateUnitInput {
  code?: string;

  name?: string;

  symbol?: string | null;

  description?: string | null;

  active?: boolean;
}

class UnitsRepository {

  async findAll(
    businessId: string
  ) {
    return db.query.units.findMany({
      where: or(
        isNull(units.businessId),
        eq(units.businessId, businessId)
      ),

      orderBy: asc(units.name),
    });
  }

  async findById(
    id: string,
    businessId: string
  ) {
    return db.query.units.findFirst({
      where: and(
        eq(units.id, id),

        or(
          isNull(units.businessId),
          eq(units.businessId, businessId)
        )
      ),
    });
  }

  async findByCode(
    code: string,
    businessId: string
  ) {
    return db.query.units.findFirst({
      where: and(
        eq(units.code, code),

        or(
          isNull(units.businessId),
          eq(units.businessId, businessId)
        )
      ),
    });
  }

  async findByName(
  name: string,
  businessId: string
) {
  return db.query.units.findFirst({
    where: and(
      eq(units.name, name),

      or(
        isNull(units.businessId),
        eq(units.businessId, businessId)
      )
    ),
  });
}

async findBySymbol(
  symbol: string,
  businessId: string
) {
  return db.query.units.findFirst({
    where: and(
      eq(units.symbol, symbol),

      or(
        isNull(units.businessId),
        eq(units.businessId, businessId)
      )
    ),
  });
}

async existsName(
  name: string,
  businessId: string
) {
  return !!(
    await this.findByName(
      name,
      businessId
    )
  );
}

async existsSymbol(
  symbol: string,
  businessId: string
) {
  return !!(
    await this.findBySymbol(
      symbol,
      businessId
    )
  );
}

  async exists(
    code: string,
    businessId: string
  ) {
    return !!(
      await this.findByCode(
        code,
        businessId
      )
    );
  }

  async create(
    data: CreateUnitInput
  ) {
    const [unit] = await db
      .insert(units)
      .values(data)
      .returning();

    return unit;
  }

  async update(
    id: string,
    businessId: string,
    data: UpdateUnitInput
  ) {
    const [unit] = await db
      .update(units)
      .set({
        ...data,

        updatedAt:
          new Date(),
      })
      .where(
        and(
          eq(units.id, id),

          eq(
            units.businessId,
            businessId
          )
        )
      )
      .returning();

    return unit ?? null;
  }

  async delete(
    id: string,
    businessId: string
  ) {
    const [unit] = await db
      .delete(units)
      .where(
        and(
          eq(units.id, id),

          eq(
            units.businessId,
            businessId
          )
        )
      )
      .returning();

    return unit ?? null;
  }

}

export const unitsRepository =
  new UnitsRepository();