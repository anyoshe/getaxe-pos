import { redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/auth/current-user";
import { BusinessCapabilityRepository } from "@/features/capabilities/repositories";
import { promotionsRepository } from "@/repositories/inventory/promotions.repository";
import { productRepository } from "@/repositories/inventory/products.repository";
import { PromotionsClient } from "@/features/inventory/components/promotions/promotions-client";

export default async function PromotionsPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const caps = await new BusinessCapabilityRepository().listEnabled(
    user.businessId,
  );
  if (!caps.includes("inventory.promotional-pricing")) {
    redirect("/settings/capabilities");
  }

  const [promotions, products] = await Promise.all([
    promotionsRepository.list(user.businessId),
    productRepository.findAll(user.businessId),
  ]);

  return (
    <div className="p-4 sm:p-6">
      <PromotionsClient
        promotions={promotions}
        products={products.map((p) => ({
          id: p.id,
          name: p.name,
          sku: p.sku,
        }))}
      />
    </div>
  );
}
