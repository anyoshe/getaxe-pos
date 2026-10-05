import Link from "next/link";

import { requireAuthorizedUser } from "@/lib/auth/authorize";
import { businessRepository } from "@/repositories/core/business.repository";

import { StarterKitsClient } from "@/features/inventory/components/starter-kits/starter-kits-client";
import {
  getStarterKitModeForBusinessType,
  listIndustryStarterStatusForBusiness,
} from "@/features/inventory/services/seed-industry-starters.service";

export const dynamic = "force-dynamic";

export default async function IndustryStarterKitsPage() {
  const user = await requireAuthorizedUser("products.view");
  const business = await businessRepository.findById(user.businessId);
  const businessType = business?.businessType ?? null;
  const mode = getStarterKitModeForBusinessType(businessType);

  if (mode.isPharmacyOnly) {
    return (
      <div className="space-y-4 p-4 md:p-6">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Starter kits</h1>
          <p className="mt-2 max-w-xl text-sm text-muted-foreground">
            This business is set up as{" "}
            <span className="font-medium text-foreground">
              {businessType ?? "pharmacy"}
            </span>
            . Industry kits (hardware, agrovet, auto) are hidden. Use the
            medicine starter list under Pharmacy catalogues.
          </p>
        </div>
        <Link
          href="/inventory/pharmacy-catalogues"
          className="inline-flex h-10 items-center justify-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          Open pharmacy catalogues &amp; starters
        </Link>
      </div>
    );
  }

  const products = await listIndustryStarterStatusForBusiness(
    user.businessId,
    undefined,
    { businessType },
  ).catch(() => []);

  return (
    <div className="space-y-4 p-4 md:p-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Starter kits</h1>
        <p className="text-sm text-muted-foreground">
          {mode.showAllIndustryKits
            ? "Your business type shows all industry kits. Pick what you need, then receive stock."
            : `Showing kits for business type ${businessType ?? "—"}. Product masters only — receive stock after adding.`}
        </p>
      </div>
      <StarterKitsClient
        products={products}
        allowedKits={mode.allowedKits}
        showAllTabs={mode.showAllIndustryKits}
        businessType={businessType}
      />
    </div>
  );
}
