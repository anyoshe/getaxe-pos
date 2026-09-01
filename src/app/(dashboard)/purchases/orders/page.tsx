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

  const [orders, suppliers, products, unitRows, allUnits] = await Promise.all([
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
    db
      .select({
        id: units.id,
        code: units.code,
        name: units.name,
      })
      .from(units)
      .where(eq(units.active, true))
      .catch(() => []),
  ]);

  const unitMeta = new Map(
    allUnits.map((u) => [u.id, { code: u.code, name: u.name }]),
  );

  const unitsByProduct = new Map<string, ProductOpt["units"]>();
  for (const row of unitRows) {
    const list = unitsByProduct.get(row.productId) ?? [];
    list.push({
      unitId: row.unitId,
      label: row.unitName || row.unitCode,
      factorToStock: Number(row.factorToStock) || 1,
      isPurchaseDefault: row.isPurchaseDefault,
      isStockUnit: row.isStockUnit,
      allowPurchase: row.allowPurchase !== false,
    });
    unitsByProduct.set(row.productId, list);
  }

  const productOpts: ProductOpt[] = (
    products as Array<{
      id: string;
      name: string;
      sku?: string | null;
      costPrice?: unknown;
      stockUnit?: { id?: string; name?: string; code?: string } | null;
      stockUnitId?: string | null;
      purchaseUnitId?: string | null;
      salesUnitId?: string | null;
      purchaseUnit?: { id?: string; name?: string; code?: string } | null;
      salesUnit?: { id?: string; name?: string; code?: string } | null;
    }>
  ).map((p) => {
    const byId = new Map<string, ProductOpt["units"][number]>();

    for (const u of unitsByProduct.get(p.id) ?? []) {
      byId.set(u.unitId, { ...u });
    }

    const ensureUnit = (
      unitId: string | null | undefined,
      opts: {
        isStockUnit?: boolean;
        isPurchaseDefault?: boolean;
        factorToStock?: number;
        labelHint?: string | null;
      },
    ) => {
      if (!unitId) return;
      const meta = unitMeta.get(unitId);
      const existing = byId.get(unitId);
      if (existing) {
        if (opts.isStockUnit) existing.isStockUnit = true;
        if (opts.isPurchaseDefault) existing.isPurchaseDefault = true;
        if (opts.factorToStock != null && existing.factorToStock === 1) {
          // keep existing factor if packaging already set
        }
        existing.allowPurchase = true;
        return;
      }
      const label =
        opts.labelHint ||
        meta?.name ||
        meta?.code ||
        "Unit";
      byId.set(unitId, {
        unitId,
        label,
        factorToStock: opts.factorToStock ?? 1,
        isPurchaseDefault: Boolean(opts.isPurchaseDefault),
        isStockUnit: Boolean(opts.isStockUnit),
        allowPurchase: true,
      });
    };

    const stockId = p.stockUnitId ?? p.stockUnit?.id ?? null;
    const purchaseId = p.purchaseUnitId ?? p.purchaseUnit?.id ?? null;
    const salesId = p.salesUnitId ?? p.salesUnit?.id ?? null;

    ensureUnit(stockId, {
      isStockUnit: true,
      factorToStock: 1,
      labelHint: p.stockUnit?.name || p.stockUnit?.code || null,
    });
    ensureUnit(purchaseId, {
      isPurchaseDefault: true,
      labelHint: p.purchaseUnit?.name || p.purchaseUnit?.code || null,
    });
    ensureUnit(salesId, {
      labelHint: p.salesUnit?.name || p.salesUnit?.code || null,
    });

    // Always allow ordering in stock units
    for (const u of byId.values()) {
      if (u.isStockUnit) u.allowPurchase = true;
    }

    let units = Array.from(byId.values());

    // Prefer purchaseable units in the list (stock always included)
    units = units.filter((u) => u.allowPurchase || u.isStockUnit);

    if (units.length === 0) {
      units = [
        {
          unitId: stockId ?? p.id,
          label:
            p.stockUnit?.name ||
            p.stockUnit?.code ||
            "Stock unit",
          factorToStock: 1,
          isPurchaseDefault: true,
          isStockUnit: true,
          allowPurchase: true,
        },
      ];
    }

    // Sort: stock first, then by factor ascending (pcs → strip → box)
    units.sort((a, b) => {
      if (a.isStockUnit !== b.isStockUnit) return a.isStockUnit ? -1 : 1;
      return a.factorToStock - b.factorToStock;
    });

    const stockLabel =
      units.find((u) => u.isStockUnit)?.label ||
      p.stockUnit?.name ||
      p.stockUnit?.code ||
      "unit";

    return {
      id: p.id,
      name: p.name,
      sku: p.sku ?? null,
      costPerStockUnit: p.costPrice != null ? Number(p.costPrice) : 0,
      stockUnitLabel: stockLabel,
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
        orderedAt: String(o.orderedAt ?? o.createdAt ?? ""),
      }))}
      suppliers={suppliers.map((s) => ({ id: s.id, name: s.name }))}
      products={productOpts}
    />
  );
}
