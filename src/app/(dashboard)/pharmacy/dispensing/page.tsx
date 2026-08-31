import { redirect } from "next/navigation";
import { and, eq, gt } from "drizzle-orm";

import { getCurrentUser } from "@/lib/auth/current-user";
import { BusinessCapabilityRepository } from "@/features/capabilities/repositories";
import { warehousesRepository } from "@/repositories/settings/warehouses.repository";
import { productRepository } from "@/repositories/inventory/products.repository";
import { dispensingRepository } from "@/repositories/pharmacy/dispensing.repository";
import { db } from "@/db";
import {
  inventoryBalances,
  productBatches,
} from "@/db/schema";
import { DispensingClient } from "@/features/pharmacy/components/dispensing-client";

export default async function DispensingPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const caps = await new BusinessCapabilityRepository().listEnabled(
    user.businessId,
  );
  if (!caps.includes("pharmacy.dispensing")) {
    redirect("/settings/capabilities");
  }

  const [warehouses, products, history, batchRows] = await Promise.all([
    warehousesRepository.findAll(user.businessId),
    productRepository.findAll(user.businessId),
    dispensingRepository.list(user.businessId),
    db
      .select({
        productId: inventoryBalances.productId,
        warehouseId: inventoryBalances.warehouseId,
        batchId: inventoryBalances.batchId,
        quantity: inventoryBalances.quantity,
        batchNumber: productBatches.batchNumber,
        expiryDate: productBatches.expiryDate,
      })
      .from(inventoryBalances)
      .innerJoin(
        productBatches,
        eq(inventoryBalances.batchId, productBatches.id),
      )
      .where(
        and(
          eq(inventoryBalances.businessId, user.businessId),
          gt(inventoryBalances.quantity, "0"),
        ),
      ),
  ]);

  const medicines = products
    .filter((p) => p.productType === "medicine" && p.active !== false)
    .map((p) => ({
      id: p.id,
      name: p.name,
      sku: p.sku,
      genericName: (p as { genericName?: string | null }).genericName ?? null,
    }));

  const batches = batchRows
    .filter((r) => r.batchId)
    .map((r) => ({
      productId: r.productId,
      warehouseId: r.warehouseId,
      batchId: r.batchId as string,
      batchNumber: r.batchNumber,
      expiryDate: r.expiryDate ? String(r.expiryDate).slice(0, 10) : null,
      quantity: Number(r.quantity) || 0,
    }));

  return (
    <div className="p-4 sm:p-6">
      <DispensingClient
        warehouses={warehouses.map((w) => ({ id: w.id, name: w.name }))}
        medicines={medicines}
        batches={batches}
        history={history}
      />
    </div>
  );
}
