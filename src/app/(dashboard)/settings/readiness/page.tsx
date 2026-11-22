import { requirePageAccess } from "@/lib/auth/authorize";
import { getSetupReadiness } from "@/features/settings/services/setup-readiness.service";
import { ReadinessClient } from "@/features/settings/components/readiness-client";

export default async function ReadinessPage() {
  const user = await requirePageAccess("business.view");

  const readiness = await getSetupReadiness(user.businessId);

  return (
    <div className="p-4 sm:p-6">
      <ReadinessClient
        score={readiness.score}
        checks={readiness.checks}
        requiredDone={readiness.requiredDone}
        requiredTotal={readiness.requiredTotal}
      />
    </div>
  );
}
