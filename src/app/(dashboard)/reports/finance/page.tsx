import Link from "next/link";

import { FinancialReportsClient } from "@/features/reports/components/financial-reports-client";

export default function FinanceReportsPage() {
  return (
    <div className="space-y-4 p-4 sm:p-6">
      <Link href="/reports" className="text-sm text-primary hover:underline">
        ← All reports
      </Link>
      <FinancialReportsClient />
    </div>
  );
}
