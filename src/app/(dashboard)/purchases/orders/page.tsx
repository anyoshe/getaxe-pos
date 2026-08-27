import { and, eq, isNull } from "drizzle-orm";

import { db } from "@/db";
import { productUnits } from "@/db/schema/inventory/product_units";
import { units } from "@/db/schema/settings/units";
import { getCurrentUser } from "@/lib/auth/current-user";
import { productService } from "@/features/inventory/services";
import { supplierService } from "@/features/inventory/services/suppliers.service";
import { purchasesQueryService } from "@/features/purchases/services";
import {
  PurchaseOrdersClient,
  type ProductOpt,
} from "@/features/purchases/components/orders/purchase-orders-client";

export default async function PurchaseOrdersPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const [orders, suppliers, products, unitRows] = await Promise.all([
    purchasesQueryService.getPurchaseOrders(user.businessId).catch(() => []),
    supplierService.getSuppliers(user.businessId).catch(() => []),
    productService.getProducts(user.businessId).catch(() => []),
    db
      .select({
        productId: productUnits.productId,
        unitId: productUnits.unitId,
        factorToStock: productUnits.factorToStock,
        isPurchaseDefault: productUnits.isPurchaseDefault,
        isStockUnit: productUnits.isStockUnit,
        allowPurchase: productUnits.allowPurchase,
        unitCode: units.code,
        unitName: units.name,
      })
      .from(productUnits)
      .innerJoin(units, eq(productUnits.unitId, units.id))
      .where(
        and(
          eq(productUnits.businessId, user.businessId),
          eq(productUnits.active, true),
          isNull(productUnits.validTo),
        ),
      )
      .catch(() => []),
  ]);

  const unitsByProduct = new Map<string, ProductOpt["units"]>();
  for (const row of unitRows) {
    const list = unitsByProduct.get(row.productId) ?? [];
    list.push({
      unitId: row.unitId,
      label: row.unitName || row.unitCode,
      factorToStock: Number(row.factorToStock) || 1,
      isPurchaseDefault: row.isPurchaseDefault,
      isStockUnit: row.isStockUnit,
      allowPurchase: row.allowPurchase,
    });
    unitsByProduct.set(row.productId, list);
  }

  const productOpts: ProductOpt[] = (
    products as Array<{
      id: string;
      name: string;
      sku?: string | null;
      costPrice?: unknown;
      stockUnit?: { name?: string; code?: string } | null;
      stockUnitId?: string | null;
    }>
  ).map((p) => {
    const pu = unitsByProduct.get(p.id) ?? [];
    const stock =
      pu.find((u) => u.isStockUnit) ??
      (p.stockUnit
        ? {
            unitId: p.stockUnitId ?? "stock",
            label: p.stockUnit.name || p.stockUnit.code || "Stock unit",
            factorToStock: 1,
            isPurchaseDefault: false,
            isStockUnit: true,
            allowPurchase: true,
          }
        : null);

    // Ensure at least stock unit option for ordering
    const units =
      pu.length > 0
        ? pu
        : stock
          ? [stock]
          : [
              {
                unitId: p.stockUnitId ?? p.id,
                label: "Unit",
                factorToStock: 1,
                isPurchaseDefault: true,
                isStockUnit: true,
                allowPurchase: true,
              },
            ];

    return {
      id: p.id,
      name: p.name,
      sku: p.sku ?? null,
      costPerStockUnit: p.costPrice != null ? Number(p.costPrice) : 0,
      stockUnitLabel: stock?.label ?? units.find((u) => u.isStockUnit)?.label ?? "unit",
      units,
    };
  });

  return (
    <PurchaseOrdersClient
      orders={(orders as Array<Record<string, unknown>>).map((o) => ({
        id: String(o.id),
        orderNumber: String(o.orderNumber ?? ""),
        status: String(o.status ?? ""),
        total: (o.total as string | number) ?? 0,
        supplierName: String(
          (o.supplier as { name?: string } | null)?.name ?? "—",
        ),
        orderedAt: o.orderedAt
          ? new Date(o.orderedAt as string | Date).toLocaleString()
          : "—",
      }))}
      suppliers={(suppliers as Array<{ id: string; name: string }>).map((s) => ({
        id: s.id,
        name: s.name,
      }))}
      products={productOpts}
    />
  );
}
