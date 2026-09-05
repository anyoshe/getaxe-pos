import { getCurrentUser } from "@/lib/auth/current-user";
import { productService } from "@/features/inventory/services";
import { warehousesService } from "@/features/settings/services/warehouses.service";
import { branchesService } from "@/features/settings/services/branches.service";
import { saleRepository } from "@/repositories/sales/sales.repository";
import { productSerials } from "@/db/schema/inventory/product_serials";
import { inventoryBalances } from "@/db/schema/inventory/inventory_balances";
import { productBatches } from "@/db/schema/inventory/product_batches";
import { db } from "@/db";
import { and, asc, eq, gt, isNull, or, sql } from "drizzle-orm";
import { productUnits } from "@/db/schema/inventory/product_units";
import { productPrices } from "@/db/schema/inventory/product_prices";
import { units } from "@/db/schema/settings/units";
import { PosClient } from "@/features/sales/components/pos/pos-client";
import { BusinessCapabilityRepository } from "@/features/capabilities/repositories";
import { promotionsRepository } from "@/repositories/inventory/promotions.repository";
import { businesses } from "@/db/schema/core/businesses";

export default async function FullScreenPosPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const businessRow = await db.query.businesses
    .findFirst({ where: eq(businesses.id, user.businessId) })
    .catch(() => null);

  const enabledCaps = await new BusinessCapabilityRepository()
    .listEnabled(user.businessId)
    .catch(() => [] as string[]);
  const activePromotions = enabledCaps.includes("inventory.promotional-pricing")
    ? await promotionsRepository.listActiveForPos(user.businessId).catch(() => [])
    : [];

  const [
    products,
    warehouses,
    branches,
    sales,
    availableSerialRows,
    productUnitRows,
    priceRows,
    stockRows,
    batchRows,
  ] = await Promise.all([
    productService.getProducts(user.businessId),
    warehousesService.getWarehouses(user.businessId),
    branchesService.getBranches(user.businessId),
    saleRepository.findRecent(user.businessId, 12),
    db
      .select({
        productId: productSerials.productId,
        warehouseId: productSerials.warehouseId,
        serialNumber: productSerials.serialNumber,
      })
      .from(productSerials)
      .where(
        and(
          eq(productSerials.businessId, user.businessId),
          eq(productSerials.status, "AVAILABLE"),
        ),
      ),
    db
      .select({
        productId: productUnits.productId,
        unitId: productUnits.unitId,
        factorToStock: productUnits.factorToStock,
        isSalesDefault: productUnits.isSalesDefault,
        isStockUnit: productUnits.isStockUnit,
        allowSale: productUnits.allowSale,
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
          or(eq(productUnits.allowSale, true), eq(productUnits.isStockUnit, true)),
        ),
      ),
    db
      .select({
        productId: productPrices.productId,
        unitId: productPrices.unitId,
        price: productPrices.price,
      })
      .from(productPrices)
      .where(
        and(
          eq(productPrices.businessId, user.businessId),
          eq(productPrices.active, true),
        ),
      ),
    // Same source of truth as Inventory → Stock on Hand
    db
      .select({
        productId: inventoryBalances.productId,
        warehouseId: inventoryBalances.warehouseId,
        quantity: sql<string>`coalesce(sum(${inventoryBalances.quantity}), 0)`,
      })
      .from(inventoryBalances)
      .where(
        and(
          eq(inventoryBalances.businessId, user.businessId),
          gt(inventoryBalances.quantity, "0"),
        ),
      )
      .groupBy(inventoryBalances.productId, inventoryBalances.warehouseId),
    db
      .select({
        productId: inventoryBalances.productId,
        warehouseId: inventoryBalances.warehouseId,
        batchId: inventoryBalances.batchId,
        quantity: inventoryBalances.quantity,
        batchNumber: productBatches.batchNumber,
        expiryDate: productBatches.expiryDate,
        manufactureDate: productBatches.manufactureDate,
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
          eq(productBatches.active, true),
        ),
      )
      .orderBy(asc(productBatches.expiryDate)),
  ]);

  const unitsByProduct: Record<
    string,
    {
      unitId: string;
      factorToStock: number;
      isSalesDefault: boolean;
      isStockUnit: boolean;
      label: string;
    }[]
  > = {};
  for (const row of productUnitRows) {
    const list = unitsByProduct[row.productId] ?? [];
    list.push({
      unitId: row.unitId,
      factorToStock: Number(row.factorToStock),
      isSalesDefault: row.isSalesDefault,
      isStockUnit: row.isStockUnit,
      label: row.unitName || row.unitCode,
    });
    unitsByProduct[row.productId] = list;
  }

  // Ensure stock / sales units appear even if packaging was incomplete
  for (const p of products as Array<{
    id: string;
    stockUnitId?: string | null;
    salesUnitId?: string | null;
    stockUnit?: { id?: string; name?: string; code?: string } | null;
    salesUnit?: { id?: string; name?: string; code?: string } | null;
  }>) {
    const list = unitsByProduct[p.id] ?? [];
    const ids = new Set(list.map((u) => u.unitId));
    const stockId = p.stockUnitId ?? p.stockUnit?.id ?? null;
    if (stockId && !ids.has(stockId)) {
      list.unshift({
        unitId: stockId,
        factorToStock: 1,
        isSalesDefault: true,
        isStockUnit: true,
        label:
          p.stockUnit?.name ||
          p.stockUnit?.code ||
          "Piece",
      });
      ids.add(stockId);
    } else if (stockId) {
      const row = list.find((u) => u.unitId === stockId);
      if (row) {
        row.isStockUnit = true;
        if (row.factorToStock <= 1) row.isSalesDefault = row.isSalesDefault || true;
      }
    }
    // Sort: stock first, then by factor ascending (pc → strip → box)
    list.sort((a, b) => {
      if (a.isStockUnit !== b.isStockUnit) return a.isStockUnit ? -1 : 1;
      return a.factorToStock - b.factorToStock;
    });
    unitsByProduct[p.id] = list;
  }

  /** productId -> warehouseId -> available serials */
  const serialsByProductWarehouse: Record<string, Record<string, string[]>> = {};
  for (const row of availableSerialRows) {
    const wid = row.warehouseId ?? "_";
    const byWh = serialsByProductWarehouse[row.productId] ?? {};
    const list = byWh[wid] ?? [];
    list.push(row.serialNumber);
    byWh[wid] = list;
    serialsByProductWarehouse[row.productId] = byWh;
  }

  /** productId -> warehouseId -> qty on hand (stock units) */
  const stockByProductWarehouse: Record<string, Record<string, number>> = {};
  for (const row of stockRows) {
    const byWh = stockByProductWarehouse[row.productId] ?? {};
    byWh[row.warehouseId] = Number(row.quantity) || 0;
    stockByProductWarehouse[row.productId] = byWh;
  }

  // Flatten serials for default warehouse (client will re-filter on warehouse change)
  const availableSerials: Record<string, string[]> = {};
  for (const [pid, byWh] of Object.entries(serialsByProductWarehouse)) {
    availableSerials[pid] = Object.values(byWh).flat();
  }

  /** productId -> unitId -> price (explicit pack price if configured) */
  /** productId -> warehouseId -> batches (FEFO ordered) */
  const batchesByProductWarehouse: Record<
    string,
    Record<
      string,
      {
        batchId: string;
        batchNumber: string;
        expiryDate: string | null;
        manufactureDate: string | null;
        quantity: number;
      }[]
    >
  > = {};
  for (const row of batchRows) {
    if (!row.batchId) continue;
    const byWh = batchesByProductWarehouse[row.productId] ?? {};
    const list = byWh[row.warehouseId] ?? [];
    list.push({
      batchId: row.batchId,
      batchNumber: row.batchNumber,
      expiryDate: row.expiryDate ? String(row.expiryDate).slice(0, 10) : null,
      manufactureDate: row.manufactureDate
        ? String(row.manufactureDate).slice(0, 10)
        : null,
      quantity: Number(row.quantity) || 0,
    });
    byWh[row.warehouseId] = list;
    batchesByProductWarehouse[row.productId] = byWh;
  }

  const pricesByProductUnit: Record<string, Record<string, number>> = {};
  for (const row of priceRows as Array<{
    productId: string;
    unitId: string | null;
    price: string;
  }>) {
    if (!row.unitId) continue;
    const byU = pricesByProductUnit[row.productId] ?? {};
    byU[row.unitId] = Number(row.price) || 0;
    pricesByProductUnit[row.productId] = byU;
  }

  return (
    <PosClient

      fullScreen
      cashierName={user.name ?? user.email}
      business={{
        name: businessRow?.name ?? "GetAxe POS",
        legalName: businessRow?.legalName ?? null,
        phone: businessRow?.phone ?? null,
        email: businessRow?.email ?? null,
        address: businessRow?.address ?? null,
        town: businessRow?.town ?? null,
        county: businessRow?.county ?? null,
        kraPin: businessRow?.kraPin ?? null,
        registrationNumber: businessRow?.registrationNumber ?? null,
        logo: businessRow?.logo ?? null,
        currency: businessRow?.currency ?? "KES",
      }}
      recentSales={sales.map((s) => ({
        id: s.id,
        invoiceNumber: s.invoiceNumber,
        total: Number(s.total ?? 0),
        soldAt: s.soldAt.toISOString?.() ?? String(s.soldAt),
      }))}
      stockByProductWarehouse={stockByProductWarehouse}
      serialsByProductWarehouse={serialsByProductWarehouse}
      products={products.map((p) => {
        const retail = Number(
          (p as { retailPrice?: number | null }).retailPrice ??
            (p as { sellingPrice?: number | null }).sellingPrice ??
            NaN,
        );
        const wholesale = Number(
          (p as { wholesalePrice?: number | null }).wholesalePrice ?? NaN,
        );
        const retailPrice =
          Number.isFinite(retail) && retail > 0
            ? retail
            : Number(p.costPrice ?? 0);
        const wholesalePrice =
          Number.isFinite(wholesale) && wholesale > 0
            ? wholesale
            : retailPrice;

        const cat = (p as { category?: { id?: string; name?: string } | null }).category;
        return {
          id: p.id,
          name: p.name,
          sku: p.sku ?? null,
          barcode: p.barcode ?? null,
          categoryId: (p as { categoryId?: string | null }).categoryId ?? cat?.id ?? null,
          categoryName: cat?.name ?? null,
          productType: p.productType,
          trackInventory: Boolean(
            (p as { trackInventory?: boolean }).trackInventory ?? true,
          ),
          serialized: Boolean((p as { serialized?: boolean }).serialized),
          trackBatch: Boolean((p as { trackBatch?: boolean }).trackBatch),
          trackExpiry: Boolean((p as { trackExpiry?: boolean }).trackExpiry),
          unitPrice: retailPrice,
          retailPrice,
          wholesalePrice,
          active: p.active !== false,
        };
      })}
      warehouses={warehouses.map((w) => ({
        id: w.id,
        name: w.name,
        branchId:
          (w as { branchId?: string | null }).branchId ?? branches[0]?.id ?? "",
      }))}
      branches={branches.map((b) => ({ id: b.id, name: b.name }))}
      availableSerials={availableSerials}
      productUnitsByProduct={unitsByProduct}
      pricesByProductUnit={pricesByProductUnit}
      batchesByProductWarehouse={batchesByProductWarehouse}
      activePromotions={activePromotions}
    />
  );
}
