import Link from "next/link";

import { StockMovementsReport } from "@/features/reports/components/stock-movements-report";
import { StockMovementMatrixReport } from "@/features/reports/components/stock-movement-matrix-report";

export default function InventoryReportsPage() {
  return (
    <div className="space-y-8 p-4 sm:p-6">
      <Link href="/reports" className="text-sm text-primary hover:underline">
        ← All reports
      </Link>
      <StockMovementMatrixReport />
      <StockMovementsReport />
    </div>
  );
}
