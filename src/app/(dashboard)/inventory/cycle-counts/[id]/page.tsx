import { notFound, redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/auth/current-user";
import { BusinessCapabilityRepository } from "@/features/capabilities/repositories";
import { stockCountsRepository } from "@/repositories/inventory/stock-counts.repository";
import { CycleCountDetailClient } from "@/features/inventory/components/cycle-counts/cycle-count-detail-client";

export default async function CycleCountDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) return null;

  const caps = await new BusinessCapabilityRepository().listEnabled(
    user.businessId,
  );
  if (!caps.includes("inventory.cycle-count")) {
    redirect("/settings/capabilities");
  }

  const { id } = await params;
  const count = await stockCountsRepository.findById(id, user.businessId);
  if (!count) notFound();

  const items = await stockCountsRepository.listItems(id, user.businessId);

  return (
    <div className="p-4 sm:p-6">
      <CycleCountDetailClient count={count} items={items} />
    </div>
  );
}
