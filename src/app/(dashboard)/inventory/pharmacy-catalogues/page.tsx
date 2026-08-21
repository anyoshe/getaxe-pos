import { getCurrentUser } from "@/lib/auth/current-user";
import { pharmacyReferenceRepository } from "@/repositories/pharmacy/reference-data.repository";
import { PharmacyCataloguesClient } from "@/features/inventory/components/pharmacy-catalogues/pharmacy-catalogues-client";

export default async function PharmacyCataloguesPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const [dosageForms, drugCategories, drugStrengths, prescriptionTypes] =
    await Promise.all([
      pharmacyReferenceRepository.listDosageForms(user.businessId),
      pharmacyReferenceRepository.listDrugCategories(user.businessId),
      pharmacyReferenceRepository.listDrugStrengths(user.businessId),
      pharmacyReferenceRepository.listPrescriptionTypes(user.businessId),
    ]);

  return (
    <div className="p-4 sm:p-6">
      <PharmacyCataloguesClient
        dosageForms={dosageForms}
        drugCategories={drugCategories}
        drugStrengths={drugStrengths}
        prescriptionTypes={prescriptionTypes}
      />
    </div>
  );
}
