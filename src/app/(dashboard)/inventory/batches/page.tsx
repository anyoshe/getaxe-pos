import Link from "next/link";

import { getCurrentUser } from "@/lib/auth/current-user";
import { productBatchService } from "@/features/inventory/services";
import { productService } from "@/features/inventory/services";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default async function BatchesPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const [batches, products] = await Promise.all([
    productBatchService.getProductBatches(user.businessId),
    productService.getProducts(user.businessId),
  ]);

  const productName = new Map(products.map((p) => [p.id, p.name]));

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-primary">
            Inventory
          </p>
          <h1 className="text-2xl font-semibold tracking-tight">Batches</h1>
          <p className="text-sm text-muted-foreground">
            Lots received into stock (including auto lots for non-batch products).
          </p>
        </div>
        <Link
          href="/inventory/stock/receive"
          className={cn(buttonVariants({ variant: "default" }))}
        >
          Receive stock
        </Link>
      </div>

      <div className="overflow-x-auto rounded-xl border">
        <table className="w-full min-w-[640px] text-sm">
          <thead className="bg-secondary/50 text-left">
            <tr>
              <th className="p-3 font-medium">Batch #</th>
              <th className="p-3 font-medium">Product</th>
              <th className="p-3 font-medium text-right">Received</th>
              <th className="p-3 font-medium text-right">Remaining</th>
              <th className="p-3 font-medium">Expiry</th>
              <th className="p-3 font-medium">Active</th>
            </tr>
          </thead>
          <tbody>
            {batches.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-muted-foreground">
                  No batches yet. Receive stock to create lots.
                </td>
              </tr>
            ) : (
              batches.map((b) => (
                <tr key={b.id} className="border-t">
                  <td className="p-3 font-medium">{b.batchNumber}</td>
                  <td className="p-3">
                    {productName.get(b.productId) ?? b.productId}
                  </td>
                  <td className="p-3 text-right tabular-nums">
                    {b.quantityReceived}
                  </td>
                  <td className="p-3 text-right tabular-nums">
                    {b.quantityRemaining}
                  </td>
                  <td className="p-3 text-muted-foreground">
                    {b.expiryDate
                      ? String(b.expiryDate).slice(0, 10)
                      : "—"}
                  </td>
                  <td className="p-3">
                    {b.active ? (
                      <span className="text-primary text-xs font-medium">Yes</span>
                    ) : (
                      <span className="text-muted-foreground text-xs">No</span>
                    )}
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
