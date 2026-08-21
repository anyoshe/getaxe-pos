import { and, asc, eq, isNull, or } from "drizzle-orm";

import {
  manufacturers,
  dosageForms,
  drugCategories,
  drugStrengths,
  prescriptionTypes,
} from "@/db/schema/pharmacy";

import { BaseRepository } from "../base";

/**
 * Business-scoped OR global (business_id IS NULL) reference rows for product wizard selects.
 */
export class PharmacyReferenceRepository extends BaseRepository {
  async listManufacturers(businessId: string) {
    return this.database
      .select({
        id: manufacturers.id,
        name: manufacturers.name,
        businessId: manufacturers.businessId,
      })
      .from(manufacturers)
      .where(
        and(
          eq(manufacturers.active, true),
          or(
            isNull(manufacturers.businessId),
            eq(manufacturers.businessId, businessId),
          ),
        ),
      )
      .orderBy(asc(manufacturers.name));
  }

  async createManufacturer(data: {
    businessId: string;
    name: string;
    country?: string | null;
  }) {
    const [row] = await this.database
      .insert(manufacturers)
      .values({
        businessId: data.businessId,
        name: data.name.trim(),
        country: data.country ?? null,
        active: true,
      })
      .returning();
    return row;
  }

  async listDosageForms(businessId: string) {
    return this.database
      .select({
        id: dosageForms.id,
        name: dosageForms.name,
        code: dosageForms.code,
      })
      .from(dosageForms)
      .where(
        and(
          eq(dosageForms.active, true),
          or(
            isNull(dosageForms.businessId),
            eq(dosageForms.businessId, businessId),
          ),
        ),
      )
      .orderBy(asc(dosageForms.name));
  }

  async createDosageForm(data: {
    businessId: string;
    code: string;
    name: string;
  }) {
    const [row] = await this.database
      .insert(dosageForms)
      .values({
        businessId: data.businessId,
        code: data.code.trim().toUpperCase(),
        name: data.name.trim(),
        active: true,
      })
      .returning();
    return row;
  }

  async listDrugCategories(businessId: string) {
    return this.database
      .select({
        id: drugCategories.id,
        name: drugCategories.name,
        code: drugCategories.code,
      })
      .from(drugCategories)
      .where(
        and(
          eq(drugCategories.active, true),
          or(
            isNull(drugCategories.businessId),
            eq(drugCategories.businessId, businessId),
          ),
        ),
      )
      .orderBy(asc(drugCategories.name));
  }

  async createDrugCategory(data: {
    businessId: string;
    code: string;
    name: string;
  }) {
    const [row] = await this.database
      .insert(drugCategories)
      .values({
        businessId: data.businessId,
        code: data.code.trim().toUpperCase(),
        name: data.name.trim(),
        active: true,
      })
      .returning();
    return row;
  }

  async listDrugStrengths(businessId: string) {
    return this.database
      .select({
        id: drugStrengths.id,
        name: drugStrengths.name,
        code: drugStrengths.code,
      })
      .from(drugStrengths)
      .where(
        and(
          eq(drugStrengths.active, true),
          or(
            isNull(drugStrengths.businessId),
            eq(drugStrengths.businessId, businessId),
          ),
        ),
      )
      .orderBy(asc(drugStrengths.name));
  }

  async createDrugStrength(data: {
    businessId: string;
    code: string;
    name: string;
  }) {
    const [row] = await this.database
      .insert(drugStrengths)
      .values({
        businessId: data.businessId,
        code: data.code.trim().toUpperCase(),
        name: data.name.trim(),
        active: true,
      })
      .returning();
    return row;
  }

  async listPrescriptionTypes(businessId: string) {
    return this.database
      .select({
        id: prescriptionTypes.id,
        name: prescriptionTypes.name,
        code: prescriptionTypes.code,
      })
      .from(prescriptionTypes)
      .where(
        and(
          eq(prescriptionTypes.active, true),
          or(
            isNull(prescriptionTypes.businessId),
            eq(prescriptionTypes.businessId, businessId),
          ),
        ),
      )
      .orderBy(asc(prescriptionTypes.name));
  }

  async createPrescriptionType(data: {
    businessId: string;
    code: string;
    name: string;
    dispensingLevel?: "OTC" | "PRESCRIPTION" | "CONTROLLED" | "NARCOTIC";
  }) {
    const [row] = await this.database
      .insert(prescriptionTypes)
      .values({
        businessId: data.businessId,
        code: data.code.trim().toUpperCase(),
        name: data.name.trim(),
        dispensingLevel: data.dispensingLevel ?? "PRESCRIPTION",
        active: true,
      })
      .returning();
    return row;
  }
}

export const pharmacyReferenceRepository =
  new PharmacyReferenceRepository();
