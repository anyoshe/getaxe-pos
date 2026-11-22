import { requirePageAccess } from "@/lib/auth/authorize";
import { pharmacyReferenceRepository } from "@/repositories/pharmacy/reference-data.repository";
import { ManufacturerClient } from "@/features/inventory/components/manufacturers/manufacturer-client";

export default async function ManufacturersPage() {
  const user = await requirePageAccess("products.view");

  const manufacturers =
    await pharmacyReferenceRepository.listManufacturers(user.businessId);

  return (
    <div className="p-4 sm:p-6">
      <ManufacturerClient manufacturers={manufacturers} />
    </div>
  );
}
