import Link from "next/link";

import { getCurrentUser } from "@/lib/auth/current-user";
import { salesQueryService } from "@/features/sales/services/sales-query.service";
import { ReturnSaleForm } from "@/features/sales/components/returns/return-sale-form";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default async function ReturnsPage({
  searchParams,
}: {
  searchParams: Promise<{ saleId?: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) return null;
  const sp = await searchParams;

  const [sales, returns] = await Promise.all([
    salesQueryService.listSales(user.businessId, {
      status: "COMPLETED",
      limit: 50,
    }),
    salesQueryService.listReturns(user.businessId),
  ]);

  let initialItems: {
    id: string;
    productId: string;
    productName: string;
    quantity: number;
    unitPrice: string | number;
    productBatchId: string | null;
  }[] = [];

  const saleId = sp.saleId ?? sales[0]?.id;
  if (saleId) {
    const detail = await salesQueryService.getSaleDetail(
      user.businessId,
      saleId,
    );
    if (detail) {
      initialItems = detail.items.map((i) => {
        const batch =
          detail.batches.find((b) => b.saleItemId === i.id)?.productBatchId ??
          null;
        return {
          id: i.id,
          productId: i.productId,
          productName: i.productName,
          quantity: i.quantity,
          unitPrice: i.unitPrice,
          productBatchId: batch,
        };
      });
    }
  }

  return (
    <div className="space-y-10 p-4 sm:p-6">
      <ReturnSaleForm
        sales={sales.map((s) => ({
          id: s.id,
          invoiceNumber: s.invoiceNumber,
          total: s.total ?? 0,
          warehouseId: s.warehouseId,
        }))}
        initialSaleId={saleId}
        initialItems={initialItems}
      />

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Recent returns</h2>
          <Link
            href="/sales/invoices"
            className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
          >
            Invoices
          </Link>
        </div>
        <div className="overflow-x-auto rounded-xl border">
          <table className="w-full text-sm">
            <thead className="bg-secondary/50 text-left">
              <tr>
                <th className="p-3">Return #</th>
                <th className="p-3">Reason</th>
                <th className="p-3 text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {returns.length === 0 ? (
                <tr>
                  <td colSpan={3} className="p-6 text-center text-muted-foreground">
                    No returns yet.
                  </td>
                </tr>
              ) : (
                returns.map((r) => (
                  <tr key={r.id} className="border-t">
                    <td className="p-3 font-medium">{r.returnNumber}</td>
                    <td className="p-3">{r.reason}</td>
                    <td className="p-3 text-right tabular-nums">
                      {Number(r.total ?? 0).toFixed(2)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
