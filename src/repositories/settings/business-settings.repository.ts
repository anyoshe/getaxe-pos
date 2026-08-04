import {
  eq,
} from "drizzle-orm";

import {
  db,
} from "@/db";

import {
  businessSettings,
} from "@/db/schema/settings/business_settings";

export class BusinessSettingsRepository {

  async findByBusinessId(
    businessId: string,
  ) {

    return db.query.businessSettings.findFirst({

      where: eq(
        businessSettings.businessId,
        businessId,
      ),

    });

  }

  async exists(
    businessId: string,
  ) {

    const settings =
      await this.findByBusinessId(
        businessId,
      );

    return !!settings;

  }

  async create(
    data: typeof businessSettings.$inferInsert,
  ) {

    const [
      settings,
    ] = await db
      .insert(
        businessSettings,
      )
      .values(
        data,
      )
      .returning();

    return settings;

  }

  async update(
    businessId: string,
    data: Partial<
      typeof businessSettings.$inferInsert
    >,
  ) {

    const [
      settings,
    ] = await db
      .update(
        businessSettings,
      )
      .set({

        ...data,

        updatedAt:
          new Date(),

      })
      .where(
        eq(
          businessSettings.businessId,
          businessId,
        ),
      )
      .returning();

    return settings ?? null;

  }

}

export const businessSettingsRepository =
  new BusinessSettingsRepository();