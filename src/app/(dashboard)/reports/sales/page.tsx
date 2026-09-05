import Link from "next/link";

import { SalesPerformanceReport } from "@/features/reports/components/sales-performance-report";

export default function SalesReportsPage() {
  return (
    <div className="space-y-4 p-4 sm:p-6">
      <Link href="/reports" className="text-sm text-primary hover:underline">
        ← All reports
      </Link>
      <SalesPerformanceReport />
    </div>
  );
}
