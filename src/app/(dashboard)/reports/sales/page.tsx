import Link from "next/link";
import { getCurrentUser } from "@/lib/auth/current-user";
import { reportsOverviewService } from "@/features/reports/services/reports-overview.service";
import { ReportsDashboard } from "@/features/reports/components/reports-dashboard";

export default async function SalesReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ period?: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) return null;
  const sp = await searchParams;
  const period =
    sp.period === "week" || sp.period === "month" ? sp.period : "day";
  const data = await reportsOverviewService.getOverview(user.businessId, period);

  return (
    <div className="space-y-4">
      <Link href="/reports" className="text-sm text-primary hover:underline">
        ← All reports
      </Link>
      <ReportsDashboard data={data} />
    </div>
  );
}
