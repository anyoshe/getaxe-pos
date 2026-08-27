import { and, eq } from "drizzle-orm";

import { getCurrentUser } from "@/lib/auth/current-user";
import { productBatchService, productService } from "@/features/inventory/services";
import { warehousesService } from "@/features/settings/services/warehouses.service";
import { unitsService } from "@/features/settings/services/units.service";
import { AdjustStockForm } from "@/features/inventory/components/stock-adjust/adjust-stock-form";
import { db } from "@/db";
import { inventoryBalances } from "@/db/schema/inventory/inventory_balances";

export default async function AdjustmentsPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const [batches, products, warehouses, balances, units] = await Promise.all([
    productBatchService.getProductBatches(user.businessId),
    productService.getProducts(user.businessId),
    warehousesService.getWarehouses(user.businessId),
    db
      .select()
      .from(inventoryBalances)
      .where(eq(inventoryBalances.businessId, user.businessId)),
    unitsService.getUnits(user.businessId),
  ]);

  const productName = new Map(products.map((p) => [p.id, p.name]));

  // Expand each batch × warehouse balance as adjust target (source of truth)
  const options: {
    id: string;
    batchNumber: string;
    productId: string;
    productName: string;
    quantityRemaining: number;
    warehouseId: string;
  }[] = [];

  for (const b of batches) {
    const batchBalances = balances.filter((bal) => bal.batchId === b.id);
    if (batchBalances.length === 0) {
      options.push({
        id: b.id,
        batchNumber: b.batchNumber,
        productId: b.productId,
        productName: productName.get(b.productId) ?? "Product",
        quantityRemaining: Number(b.quantityRemaining),
        warehouseId: warehouses[0]?.id ?? "",
      });
    } else {
      for (const bal of batchBalances) {
        options.push({
          id: b.id,
          batchNumber: `${b.batchNumber}`,
          productId: b.productId,
          productName: productName.get(b.productId) ?? "Product",
          quantityRemaining: Number(bal.quantity),
          warehouseId: bal.warehouseId,
        });
      }
    }
  }

  return (
    <div className="p-4 sm:p-6">
      <AdjustStockForm
        units={units.map((u) => ({ id: u.id, name: u.name }))}
        batches={options.map((o) => ({
          id: o.id,
          batchNumber: o.batchNumber,
          productId: o.productId,
          productName: o.productName,
          quantityRemaining: o.quantityRemaining,
          warehouseId: o.warehouseId,
        }))}
        warehouses={warehouses.map((w) => ({ id: w.id, name: w.name }))}
      />
    </div>
  );
}
