import Link from "next/link";

import { getCurrentUser } from "@/lib/auth/current-user";
import { getStockMovements } from "@/features/inventory/queries";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

function formatDate(value: Date | string) {
  return new Intl.DateTimeFormat("en-KE", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export default async function StockMovementsPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const movements = await getStockMovements({
    businessId: user.businessId,
  });

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-primary">
            Inventory
          </p>
          <h1 className="text-2xl font-semibold tracking-tight">
            Stock movements
          </h1>
          <p className="text-sm text-muted-foreground">
            Audit trail of receives, adjustments, transfers, and other quantity
            changes.
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/inventory/stock/receive"
            className={cn(buttonVariants({ variant: "default" }))}
          >
            Receive stock
          </Link>
          <Link
            href="/inventory/adjustments"
            className={cn(buttonVariants({ variant: "outline" }))}
          >
            Adjust
          </Link>
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border">
        <table className="w-full min-w-[720px] text-sm">
          <thead className="bg-secondary/50 text-left">
            <tr>
              <th className="p-3 font-medium">When</th>
              <th className="p-3 font-medium">Type</th>
              <th className="p-3 font-medium">Product</th>
              <th className="p-3 font-medium">Warehouse</th>
              <th className="p-3 font-medium">Batch</th>
              <th className="p-3 font-medium text-right">Qty</th>
              <th className="p-3 font-medium">Reference</th>
            </tr>
          </thead>
          <tbody>
            {movements.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-8 text-center text-muted-foreground">
                  No movements yet.{" "}
                  <Link
                    href="/inventory/stock/receive"
                    className="font-medium text-primary underline-offset-4 hover:underline"
                  >
                    Receive stock
                  </Link>
                </td>
              </tr>
            ) : (
              movements.map((m) => (
                <tr key={m.id} className="border-t">
                  <td className="p-3 text-muted-foreground whitespace-nowrap">
                    {formatDate(m.createdAt)}
                  </td>
                  <td className="p-3">
                    <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                      {m.movementType}
                    </span>
                  </td>
                  <td className="p-3 font-medium">{m.productName}</td>
                  <td className="p-3 text-muted-foreground">{m.warehouseName}</td>
                  <td className="p-3 text-muted-foreground">
                    {m.batchNumber ?? "—"}
                  </td>
                  <td
                    className={`p-3 text-right tabular-nums font-medium ${
                      Number(m.quantity) < 0 ? "text-destructive" : "text-primary"
                    }`}
                  >
                    {Number(m.quantity) > 0 ? "+" : ""}
                    {m.quantity}
                  </td>
                  <td className="p-3 text-muted-foreground">
                    {m.reference ?? "—"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
