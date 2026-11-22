import Link from "next/link";
import { Package } from "lucide-react";

import { requirePageAccess } from "@/lib/auth/authorize";
import { getStockOnHand } from "@/features/inventory/queries";
import { StockOnHandActions } from "@/features/inventory/components/stock/stock-on-hand-actions";
import { EmptyState } from "@/components/shared";

export default async function StockOnHandPage() {
  const user = await requirePageAccess("stock_movements.view");

  const rows = await getStockOnHand({
    businessId: user.businessId,
  });

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-primary">
            Inventory
          </p>
          <h1 className="text-2xl font-semibold tracking-tight">Stock on hand</h1>
          <p className="text-sm text-muted-foreground">
            Quantities by product and warehouse after receive movements.
          </p>
        </div>
        <StockOnHandActions />
      </div>

      {rows.length === 0 ? (
        <EmptyState
          icon={Package}
          title="No stock yet"
          description="Receive goods or load a starter kit so quantities appear here."
          actionHref="/inventory/stock/receive"
          actionLabel="Receive stock"
        />
      ) : (
        <>
          <ul className="grid gap-3 md:hidden">
            {rows.map((row) => (
              <li
                key={`${row.productId}-${row.warehouseId}`}
                className="rounded-xl border border-border bg-card p-4 shadow-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate font-semibold">{row.productName}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {row.warehouseName}
                    </p>
                  </div>
                  <p className="shrink-0 text-lg font-semibold tabular-nums">
                    {row.quantity}
                  </p>
                </div>
              </li>
            ))}
          </ul>

          <div className="hidden overflow-x-auto rounded-xl border md:block">
            <table className="w-full min-w-[560px] text-sm">
              <thead className="bg-secondary/50 text-left">
                <tr>
                  <th className="p-3 font-medium">Product</th>
                  <th className="p-3 font-medium">Warehouse</th>
                  <th className="p-3 font-medium text-right">Quantity</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr
                    key={`${row.productId}-${row.warehouseId}`}
                    className="border-t"
                  >
                    <td className="p-3 font-medium">{row.productName}</td>
                    <td className="p-3 text-muted-foreground">
                      {row.warehouseName}
                    </td>
                    <td className="p-3 text-right tabular-nums">{row.quantity}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
