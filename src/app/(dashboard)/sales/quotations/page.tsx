import { getCurrentUser } from "@/lib/auth/current-user";
import { productService } from "@/features/inventory/services";
import { warehousesService } from "@/features/settings/services/warehouses.service";
import { salesQueryService } from "@/features/sales/services/sales-query.service";
import { SalesDocumentForm } from "@/features/sales/components/documents/sales-document-form";
import { db } from "@/db";
import { productSerials } from "@/db/schema/inventory/product_serials";
import { and, eq } from "drizzle-orm";

export default async function QuotationsPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const [products, warehouses, drafts, serialRows] = await Promise.all([
    productService.getProducts(user.businessId),
    warehousesService.getWarehouses(user.businessId),
    salesQueryService.listSales(user.businessId, {
      status: "DRAFT",
      limit: 100,
    }),
    db
      .select({
        productId: productSerials.productId,
        serialNumber: productSerials.serialNumber,
      })
      .from(productSerials)
      .where(
        and(
          eq(productSerials.businessId, user.businessId),
          eq(productSerials.status, "AVAILABLE"),
        ),
      ),
  ]);

  const availableSerials: Record<string, string[]> = {};
  for (const row of serialRows) {
    const list = availableSerials[row.productId] ?? [];
    list.push(row.serialNumber);
    availableSerials[row.productId] = list;
  }

  return (
    <div className="p-4 sm:p-6">
      <SalesDocumentForm
        documentType="quotation"
        products={products.map((p) => {
          const retail = Number(
            (p as { retailPrice?: number | null }).retailPrice ??
              (p as { sellingPrice?: number | null }).sellingPrice ??
              p.costPrice ??
              0,
          );
          const wholesale = Number(
            (p as { wholesalePrice?: number | null }).wholesalePrice ?? retail,
          );
          return {
            id: p.id,
            name: p.name,
            sku: p.sku ?? null,
            retailPrice: retail,
            wholesalePrice: wholesale,
            serialized: Boolean(p.serialized),
          };
        })}
        availableSerials={availableSerials}
        warehouses={warehouses.map((w) => ({
          id: w.id,
          name: w.name,
          branchId: w.branchId,
        }))}
        drafts={drafts.map((d) => ({
          id: d.id,
          invoiceNumber: d.invoiceNumber,
          total: d.total ?? 0,
          notes: d.notes,
          status: d.status,
        }))}
      />
    </div>
  );
}
