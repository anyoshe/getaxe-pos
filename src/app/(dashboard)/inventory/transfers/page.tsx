import { getCurrentUser } from "@/lib/auth/current-user";
import { productBatchService, productService } from "@/features/inventory/services";
import { warehousesService } from "@/features/settings/services/warehouses.service";
import { TransferStockForm } from "@/features/inventory/components/stock-transfer/transfer-stock-form";

export default async function TransfersPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const [batches, products, warehouses] = await Promise.all([
    productBatchService.getProductBatches(user.businessId),
    productService.getProducts(user.businessId),
    warehousesService.getWarehouses(user.businessId),
  ]);

  const productName = new Map(products.map((p) => [p.id, p.name]));

  return (
    <div className="p-4 sm:p-6">
      <TransferStockForm
        batches={batches.map((b) => ({
          id: b.id,
          batchNumber: b.batchNumber,
          productId: b.productId,
          productName: productName.get(b.productId) ?? "Product",
          quantityRemaining: Number(b.quantityRemaining),
        }))}
        warehouses={warehouses.map((w) => ({ id: w.id, name: w.name }))}
      />
    </div>
  );
}
