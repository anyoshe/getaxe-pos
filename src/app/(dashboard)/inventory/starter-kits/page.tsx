import { requireAuthorizedUser } from "@/lib/auth/authorize";

import { StarterKitsClient } from "@/features/inventory/components/starter-kits/starter-kits-client";
import { listIndustryStarterStatusForBusiness } from "@/features/inventory/services/seed-industry-starters.service";

export const dynamic = "force-dynamic";

export default async function IndustryStarterKitsPage() {
  const user = await requireAuthorizedUser("products.view");
  const products = await listIndustryStarterStatusForBusiness(
    user.businessId,
  ).catch(() => []);

  return (
    <div className="space-y-4 p-4 md:p-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Starter kits</h1>
        <p className="text-sm text-muted-foreground">
          Hardware, agrovet, motorbike and auto product masters for faster
          onboarding.
        </p>
      </div>
      <StarterKitsClient products={products} />
    </div>
  );
}
