import { getCurrentUser } from "@/lib/auth/current-user";
import { productService } from "@/features/inventory/services";
import { supplierService } from "@/features/inventory/services/suppliers.service";
import { purchasesQueryService } from "@/features/purchases/services";
import { PurchaseOrdersClient } from "@/features/purchases/components/orders/purchase-orders-client";

export default async function PurchaseOrdersPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const [orders, suppliers, products] = await Promise.all([
    purchasesQueryService.getPurchaseOrders(user.businessId).catch(() => []),
    supplierService.getSuppliers(user.businessId).catch(() => []),
    productService.getProducts(user.businessId).catch(() => []),
  ]);

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
      products={(products as Array<{ id: string; name: string; costPrice?: unknown }>).map(
        (p) => ({
          id: p.id,
          name: p.name,
          costPrice: p.costPrice != null ? Number(p.costPrice) : 0,
        }),
      )}
    />
  );
}
