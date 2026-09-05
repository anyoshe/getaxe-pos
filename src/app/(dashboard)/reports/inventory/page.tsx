import Link from "next/link";

import { StockMovementsReport } from "@/features/reports/components/stock-movements-report";

export default function InventoryReportsPage() {
  return (
    <div className="space-y-4 p-4 sm:p-6">
      <Link href="/reports" className="text-sm text-primary hover:underline">
        ← All reports
      </Link>
      <StockMovementsReport />
    </div>
  );
}
