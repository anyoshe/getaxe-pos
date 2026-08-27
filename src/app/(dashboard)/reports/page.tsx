import { Suspense } from "react";

import { getCurrentUser } from "@/lib/auth/current-user";
import { reportsOverviewService } from "@/features/reports/services/reports-overview.service";
import { ReportsDashboard } from "@/features/reports/components/reports-dashboard";

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ period?: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) return null;

  const sp = await searchParams;
  const period =
    sp.period === "week" || sp.period === "month" ? sp.period : "day";

  const data = await reportsOverviewService
    .getOverview(user.businessId, period)
    .catch(() => null);

  if (!data) {
    return (
      <div className="p-6 text-sm text-muted-foreground">
        Unable to load reports. Ensure sales and inventory data are available.
      </div>
    );
  }

  return (
    <Suspense fallback={<div className="p-6 text-sm">Loading reports…</div>}>
      <ReportsDashboard data={data} />
    </Suspense>
  );
}
