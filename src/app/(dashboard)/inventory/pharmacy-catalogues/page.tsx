import { getCurrentUser } from "@/lib/auth/current-user";
import { pharmacyReferenceRepository } from "@/repositories/pharmacy/reference-data.repository";
import { PharmacyCataloguesClient } from "@/features/inventory/components/pharmacy-catalogues/pharmacy-catalogues-client";
import {
  listStarterStatusForBusiness,
  listProgrammeTbHivTemplates,
} from "@/features/pharmacy/services/seed-pharmacy-starter-products.service";
import { db } from "@/db";
import { products } from "@/db/schema/inventory/products";
import { and, eq, inArray } from "drizzle-orm";

export default async function PharmacyCataloguesPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const programmeTemplates = listProgrammeTbHivTemplates();
  const programmeSkus = programmeTemplates.map((t) => t.sku);

  const [
    dosageForms,
    drugCategories,
    drugStrengths,
    prescriptionTypes,
    starters,
    existingProgramme,
  ] = await Promise.all([
    pharmacyReferenceRepository.listDosageForms(user.businessId),
    pharmacyReferenceRepository.listDrugCategories(user.businessId),
    pharmacyReferenceRepository.listDrugStrengths(user.businessId),
    pharmacyReferenceRepository.listPrescriptionTypes(user.businessId),
    listStarterStatusForBusiness(user.businessId).catch(() => []),
    programmeSkus.length
      ? db.query.products.findMany({
          where: and(
            eq(products.businessId, user.businessId),
            inArray(products.sku, programmeSkus),
          ),
          columns: { sku: true },
        })
      : Promise.resolve([]),
  ]);

  const have = new Set(
    existingProgramme.map((r) => (r.sku || "").toUpperCase()),
  );
  const programmeProducts = programmeTemplates.map((t) => ({
    code: t.code,
    name: t.name,
    genericName: t.genericName,
    sku: t.sku,
    categoryName: t.categoryName,
    dosageFormCode: t.dosageFormCode,
    drugCategoryCode: t.drugCategoryCode,
    strengthLabel: t.strengthLabel,
    prescriptionTypeCode: t.prescriptionTypeCode,
    suggestedCost: t.suggestedCost ?? null,
    suggestedSell: t.suggestedSell ?? null,
    packSize: t.packSize ?? null,
    alreadyInCatalogue: have.has(t.sku.toUpperCase()),
  }));

  return (
    <div className="p-4 sm:p-6">
      <PharmacyCataloguesClient
        dosageForms={dosageForms}
        drugCategories={drugCategories}
        drugStrengths={drugStrengths}
        prescriptionTypes={prescriptionTypes}
        starterProducts={starters}
        programmeProducts={programmeProducts}
      />
    </div>
  );
}
