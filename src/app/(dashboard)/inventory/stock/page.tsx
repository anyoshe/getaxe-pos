import { getCurrentUser } from "@/lib/auth/current-user";
import { getStockOnHand } from "@/features/inventory/queries/stock-on-hand.query";
import { StockOnHandActions } from "@/features/inventory/components/stock/stock-on-hand-actions";

export default async function StockOnHandPage() {
  const user = await getCurrentUser();
  if (!user) return null;

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

      <div className="overflow-x-auto rounded-xl border">
        <table className="w-full min-w-[560px] text-sm">
          <thead className="bg-secondary/50 text-left">
            <tr>
              <th className="p-3 font-medium">Product</th>
              <th className="p-3 font-medium">Warehouse</th>
              <th className="p-3 font-medium text-right">Quantity</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td
                  colSpan={3}
                  className="p-8 text-center text-muted-foreground"
                >
                  No stock yet.{" "}
                  <Link
                    href="/inventory/stock/receive"
                    className="font-medium text-primary underline-offset-4 hover:underline"
                  >
                    Receive stock
                  </Link>{" "}
                  to get started.
                </td>
              </tr>
            ) : (
              rows.map((row) => (
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
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
