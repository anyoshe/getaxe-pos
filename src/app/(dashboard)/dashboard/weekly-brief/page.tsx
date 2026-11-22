import { requirePageAccess } from "@/lib/auth/authorize";
import { buildWeeklyOwnerBrief } from "@/features/dashboard/services/weekly-owner-brief.service";
import { WeeklyOwnerBriefClient } from "@/features/dashboard/components/weekly-owner-brief-client";

export const dynamic = "force-dynamic";

export default async function WeeklyBriefPage() {
  const user = await requirePageAccess("dashboard.view");

  const brief = await buildWeeklyOwnerBrief(user.businessId);

  return (
    <div className="p-4 sm:p-6">
      <WeeklyOwnerBriefClient brief={brief} />
    </div>
  );
}
