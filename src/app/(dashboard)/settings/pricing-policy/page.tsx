import { getPricingPolicyAction } from "@/features/settings/actions/pricing-policy";
import { PricingPolicyClient } from "@/features/settings/components/pricing-policy-client";

export const dynamic = "force-dynamic";

export default async function PricingPolicyPage() {
  const data = await getPricingPolicyAction();
  return (
    <div className="p-4 sm:p-6">
      <PricingPolicyClient
        initialPolicy={data.belowCostSalePolicy}
        initialFooter={data.documentFooter}
        businessName={data.name}
      />
    </div>
  );
}
