import { getCurrentUser } from "@/lib/auth/current-user";
import { getSetupReadiness } from "@/features/settings/services/setup-readiness.service";
import { SetupGuideClient } from "@/features/settings/components/setup-guide-client";
import { businessRepository } from "@/repositories/core/business.repository";

export const dynamic = "force-dynamic";

export default async function SetupGuidePage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const [readiness, business] = await Promise.all([
    getSetupReadiness(user.businessId),
    businessRepository.findById(user.businessId).catch(() => null),
  ]);

  return (
    <div className="p-4 sm:p-6">
      <SetupGuideClient
        businessName={business?.name ?? user.business?.name ?? null}
        businessType={
          (business as { businessType?: string } | null)?.businessType ??
          null
        }
        score={readiness.score}
        checks={readiness.checks}
        requiredDone={readiness.requiredDone}
        requiredTotal={readiness.requiredTotal}
      />
    </div>
  );
}
