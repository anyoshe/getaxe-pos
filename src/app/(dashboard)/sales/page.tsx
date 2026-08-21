import { getCurrentUser } from "@/lib/auth/current-user";
import { productService } from "@/features/inventory/services";
import { warehousesService } from "@/features/settings/services/warehouses.service";
import { branchesService } from "@/features/settings/services/branches.service";
import { saleRepository } from "@/repositories/sales/sales.repository";
import { productSerialRepository } from "@/repositories/inventory/product-serials.repository";
import { PosClient } from "@/features/sales/components/pos/pos-client";
import { db } from "@/db";
import { productSerials } from "@/db/schema/inventory/product_serials";
import { and, eq } from "drizzle-orm";

function formatMoney(value: string | number) {
  return new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency: "KES",
    maximumFractionDigits: 2,
  }).format(Number(value));
}

function formatDate(value: Date | string) {
  return new Intl.DateTimeFormat("en-KE", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export default async function SalesPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const [products, warehouses, branches, sales, availableSerialRows] =
    await Promise.all([
      productService.getProducts(user.businessId),
      warehousesService.getWarehouses(user.businessId),
      branchesService.getBranches(user.businessId),
      saleRepository.findRecent(user.businessId, 20),
      db
        .select({
          productId: productSerials.productId,
          serialNumber: productSerials.serialNumber,
          warehouseId: productSerials.warehouseId,
        })
        .from(productSerials)
        .where(
          and(
            eq(productSerials.businessId, user.businessId),
            eq(productSerials.status, "AVAILABLE"),
          ),
        ),
    ]);

  // Group serials by product (all warehouses; POS can refine later by warehouse)
  const availableSerials: Record<string, string[]> = {};
  for (const row of availableSerialRows) {
    const list = availableSerials[row.productId] ?? [];
    list.push(row.serialNumber);
    availableSerials[row.productId] = list;
  }

  return (
    <div className="space-y-10 p-4 sm:p-6">
      <PosClient
        products={products.map((p) => {
          const selling = Number(
            (p as { sellingPrice?: number | null }).sellingPrice ?? NaN,
          );
          const unitPrice =
            Number.isFinite(selling) && selling > 0
              ? selling
              : Number(p.costPrice ?? 0);

          return {
            id: p.id,
            name: p.name,
            sku: p.sku ?? null,
            barcode: p.barcode ?? null,
            productType: p.productType,
            trackInventory: p.trackInventory,
            serialized: Boolean(p.serialized),
            unitPrice,
            active: p.active !== false,
          };
        })}
        warehouses={warehouses.map((w) => ({
          id: w.id,
          name: w.name,
          branchId: w.branchId,
        }))}
        branches={branches.map((b) => ({ id: b.id, name: b.name }))}
        availableSerials={availableSerials}
      />

      <section className="space-y-3">
        <div>
          <h2 className="text-lg font-semibold">Recent sales</h2>
          <p className="text-sm text-muted-foreground">
            Latest completed invoices for this business.
          </p>
        </div>

        <div className="overflow-x-auto rounded-xl border">
          <table className="w-full min-w-[560px] text-sm">
            <thead className="bg-secondary/50 text-left">
              <tr>
                <th className="p-3 font-medium">Invoice</th>
                <th className="p-3 font-medium">When</th>
                <th className="p-3 font-medium">Status</th>
                <th className="p-3 font-medium text-right">Total</th>
                <th className="p-3 font-medium">Payment</th>
              </tr>
            </thead>
            <tbody>
              {sales.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="p-8 text-center text-muted-foreground"
                  >
                    No sales yet. Complete a sale above.
                  </td>
                </tr>
              ) : (
                sales.map((s) => (
                  <tr key={s.id} className="border-t">
                    <td className="p-3 font-medium">{s.invoiceNumber}</td>
                    <td className="p-3 text-muted-foreground">
                      {formatDate(s.soldAt)}
                    </td>
                    <td className="p-3">
                      <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary">
                        {s.status}
                      </span>
                    </td>
                    <td className="p-3 text-right tabular-nums">
                      {formatMoney(s.total ?? 0)}
                    </td>
                    <td className="p-3 text-muted-foreground">
                      {s.paymentStatus}
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
