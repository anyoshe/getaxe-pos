import { getCurrentUser } from "@/lib/auth/current-user";
import { productService } from "@/features/inventory/services";
import { supplierService } from "@/features/inventory/services/suppliers.service";
import { warehousesService } from "@/features/settings/services/warehouses.service";
import { SupplierReturnsClient } from "@/features/purchases/components/returns/supplier-returns-client";

export default async function SupplierReturnsPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const [suppliers, products, warehouses] = await Promise.all([
    supplierService.getSuppliers(user.businessId).catch(() => []),
    productService.getProducts(user.businessId).catch(() => []),
    warehousesService.getWarehouses(user.businessId).catch(() => []),
  ]);

  return (
    <SupplierReturnsClient
      suppliers={(suppliers as Array<{ id: string; name: string }>).map((s) => ({
        id: s.id,
        name: s.name,
      }))}
      products={(products as Array<{ id: string; name: string }>).map((p) => ({
        id: p.id,
        name: p.name,
      }))}
      warehouses={(warehouses as Array<{ id: string; name: string }>).map((w) => ({
        id: w.id,
        name: w.name,
      }))}
    />
  );
}
