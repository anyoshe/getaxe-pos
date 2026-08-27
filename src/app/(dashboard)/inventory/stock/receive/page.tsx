import { getCurrentUser } from "@/lib/auth/current-user";
import { productService } from "@/features/inventory/services";
import { warehousesService } from "@/features/settings/services/warehouses.service";
import { supplierService } from "@/features/inventory/services";
import { ReceiveStockForm } from "@/features/inventory/components/stock-receive";

export default async function ReceiveStockPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const [products, warehouses, suppliers] = await Promise.all([
    productService.getProducts(user.businessId),
    warehousesService.getWarehouses(user.businessId),
    supplierService.getSuppliers(user.businessId),
  ]);

  return (
    <div className="p-4 sm:p-6">
      <ReceiveStockForm
        products={products as any}
        warehouses={warehouses.map((w) => ({
          id: w.id,
          name: w.name,
          code: w.code,
        }))}
        suppliers={suppliers.map((s) => ({ id: s.id, name: s.name }))}
      />
    </div>
  );
}
