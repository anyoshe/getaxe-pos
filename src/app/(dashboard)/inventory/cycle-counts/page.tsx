import { redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/auth/current-user";
import { BusinessCapabilityRepository } from "@/features/capabilities/repositories";
import { warehousesRepository } from "@/repositories/settings/warehouses.repository";
import { stockCountsRepository } from "@/repositories/inventory/stock-counts.repository";
import { CycleCountsClient } from "@/features/inventory/components/cycle-counts/cycle-counts-client";

export default async function CycleCountsPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const caps = await new BusinessCapabilityRepository().listEnabled(
    user.businessId,
  );
  if (!caps.includes("inventory.cycle-count")) {
    redirect("/settings/capabilities");
  }

  const [warehouses, counts] = await Promise.all([
    warehousesRepository.findAll(user.businessId),
    stockCountsRepository.list(user.businessId),
  ]);

  return (
    <div className="p-4 sm:p-6">
      <CycleCountsClient warehouses={warehouses} counts={counts} />
    </div>
  );
}
