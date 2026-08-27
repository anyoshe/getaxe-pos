import { and, eq, isNull } from "drizzle-orm";

import { db } from "@/db";
import { productUnits } from "@/db/schema/inventory/product_units";
import { units } from "@/db/schema/settings/units";
import { getCurrentUser } from "@/lib/auth/current-user";
import { productService } from "@/features/inventory/services";
import { warehousesService } from "@/features/settings/services/warehouses.service";
import { purchasesQueryService } from "@/features/purchases/services";
import { purchaseOrderRepository } from "@/repositories/purchasing/purchase-orders.repository";
import { GoodsReceivingClient } from "@/features/purchases/components/receiving/goods-receiving-client";

export default async function GoodsReceivingPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const [orderList, warehouses, receipts, products, unitRows] = await Promise.all([
    purchasesQueryService.getPurchaseOrders(user.businessId).catch(() => []),
    warehousesService.getWarehouses(user.businessId).catch(() => []),
    purchasesQueryService.getGoodsReceipts(user.businessId).catch(() => []),
    productService.getProducts(user.businessId).catch(() => []),
    db
      .select({
        productId: productUnits.productId,
        unitId: productUnits.unitId,
        factorToStock: productUnits.factorToStock,
        isPurchaseDefault: productUnits.isPurchaseDefault,
        isStockUnit: productUnits.isStockUnit,
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

  const productMeta = new Map(
    (products as Array<{ id: string; name: string; stockUnit?: { name?: string } | null }>).map(
      (p) => [
        p.id,
        {
          name: p.name,
          stockUnitLabel: p.stockUnit?.name ?? "unit",
        },
      ],
    ),
  );

  const unitsByProduct = new Map<
    string,
    {
      unitId: string;
      label: string;
      factorToStock: number;
      isStockUnit: boolean;
      isPurchaseDefault: boolean;
    }[]
  >();
  for (const row of unitRows) {
    const list = unitsByProduct.get(row.productId) ?? [];
    list.push({
      unitId: row.unitId,
      label: row.unitName || row.unitCode,
      factorToStock: Number(row.factorToStock) || 1,
      isStockUnit: row.isStockUnit,
      isPurchaseDefault: row.isPurchaseDefault,
    });
    unitsByProduct.set(row.productId, list);
  }

  const detailed = await Promise.all(
    (orderList as Array<{ id: string }>).map(async (o) => {
      const full = await purchaseOrderRepository.findById(o.id).catch(() => null);
      return full;
    }),
  );

  const purchaseOrders = detailed
    .filter(Boolean)
    .map((po) => {
      const p = po as {
        id: string;
        orderNumber: string;
        supplierId: string;
        status: string;
        supplier?: { name?: string } | null;
        items?: Array<{
          productId: string;
          quantity: number;
          receivedQuantity: number;
          unitCost: string;
        }>;
      };
      return {
        id: p.id,
        orderNumber: p.orderNumber,
        supplierId: p.supplierId,
        supplierName: p.supplier?.name ?? "—",
        status: p.status,
        items: (p.items ?? []).map((it) => {
          const meta = productMeta.get(it.productId);
          return {
            productId: it.productId,
            productName: meta?.name ?? it.productId.slice(0, 8),
            quantity: Number(it.quantity),
            receivedQuantity: Number(it.receivedQuantity ?? 0),
            unitCost: Number(it.unitCost),
            stockUnitLabel: meta?.stockUnitLabel ?? "unit",
            units: unitsByProduct.get(it.productId) ?? [],
          };
        }),
      };
    });

  return (
    <GoodsReceivingClient
      purchaseOrders={purchaseOrders}
      warehouses={(warehouses as Array<{ id: string; name: string }>).map((w) => ({
        id: w.id,
        name: w.name,
      }))}
      receipts={(receipts as Array<Record<string, unknown>>).map((r) => ({
        id: String(r.id),
        receiptNumber: String(r.receiptNumber ?? ""),
        status: String(r.status ?? ""),
        total: (r.total as string | number) ?? 0,
        supplierName: String(
          (r.supplier as { name?: string } | null)?.name ?? "—",
        ),
        receivedAt: r.receivedAt
          ? new Date(r.receivedAt as string | Date).toLocaleString()
          : "—",
      }))}
    />
  );
}
