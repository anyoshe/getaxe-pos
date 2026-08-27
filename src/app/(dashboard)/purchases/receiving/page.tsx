import { getCurrentUser } from "@/lib/auth/current-user";
import { productService } from "@/features/inventory/services";
import { warehousesService } from "@/features/settings/services/warehouses.service";
import { purchasesQueryService } from "@/features/purchases/services";
import { purchaseOrderRepository } from "@/repositories/purchasing/purchase-orders.repository";
import { GoodsReceivingClient } from "@/features/purchases/components/receiving/goods-receiving-client";

export default async function GoodsReceivingPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const [orderList, warehouses, receipts, products] = await Promise.all([
    purchasesQueryService.getPurchaseOrders(user.businessId).catch(() => []),
    warehousesService.getWarehouses(user.businessId).catch(() => []),
    purchasesQueryService.getGoodsReceipts(user.businessId).catch(() => []),
    productService.getProducts(user.businessId).catch(() => []),
  ]);

  const productName = new Map(
    (products as Array<{ id: string; name: string }>).map((p) => [p.id, p.name]),
  );

  const detailed = await Promise.all(
    (orderList as Array<{ id: string }>).map(async (o) => {
      const full = await purchaseOrderRepository.findById(o.id).catch(() => null);
      if (!full) return null;
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
        items: (p.items ?? []).map((it) => ({
          productId: it.productId,
          productName: productName.get(it.productId) ?? it.productId.slice(0, 8),
          quantity: Number(it.quantity),
          receivedQuantity: Number(it.receivedQuantity ?? 0),
          unitCost: Number(it.unitCost),
        })),
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
