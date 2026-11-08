import { getCurrentUser } from "@/lib/auth/current-user";
import { buildWeeklyOwnerBrief } from "@/features/dashboard/services/weekly-owner-brief.service";
import { WeeklyOwnerBriefClient } from "@/features/dashboard/components/weekly-owner-brief-client";

export const dynamic = "force-dynamic";

export default async function WeeklyBriefPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const brief = await buildWeeklyOwnerBrief(user.businessId);

  return (
    <div className="p-4 sm:p-6">
      <WeeklyOwnerBriefClient brief={brief} />
    </div>
  );
}
