import { getCurrentUser } from "@/lib/auth/current-user";
import { getSetupReadiness } from "@/features/settings/services/setup-readiness.service";
import { ReadinessClient } from "@/features/settings/components/readiness-client";

export default async function ReadinessPage() {
  const user = await getCurrentUser();
  if (!user) return null;

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
