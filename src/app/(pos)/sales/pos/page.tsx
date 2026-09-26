import { getCurrentUser } from "@/lib/auth/current-user";
import { productService } from "@/features/inventory/services";
import { warehousesService } from "@/features/settings/services/warehouses.service";
import { branchesService } from "@/features/settings/services/branches.service";
import { saleRepository } from "@/repositories/sales/sales.repository";
import { db } from "@/db";
import { eq } from "drizzle-orm";
import { PosClient } from "@/features/sales/components/pos/pos-client";
import { BusinessCapabilityRepository } from "@/features/capabilities/repositories";
import { promotionsRepository } from "@/repositories/inventory/promotions.repository";
import { businesses } from "@/db/schema/core/businesses";
import { financeService } from "@/features/finance/services/finance.service";
import { loadPosSupport } from "@/features/sales/actions/search-pos-products";

export default async function FullScreenPosPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const cashAccountsRaw = await financeService
    .getCashAccounts(user.businessId)
    .catch(() => [] as Awaited<ReturnType<typeof financeService.getCashAccounts>>);
  const cashAccounts = cashAccountsRaw.map((a) => ({
    id: a.id,
    name: a.name,
    type: a.type,
    bankName: (a as { bankName?: string | null }).bankName ?? null,
    accountNumber: (a as { accountNumber?: string | null }).accountNumber ?? null,
    branchName: (a as { branchName?: string | null }).branchName ?? null,
    active: a.active !== false,
  }));

  const businessRow = await db.query.businesses
    .findFirst({ where: eq(businesses.id, user.businessId) })
    .catch(() => null);

  const enabledCaps = await new BusinessCapabilityRepository()
    .listEnabled(user.businessId)
    .catch(() => [] as string[]);
  const activePromotions = enabledCaps.includes("inventory.promotional-pricing")
    ? await promotionsRepository.listActiveForPos(user.businessId).catch(() => [])
    : [];

  const INITIAL_POS_PRODUCTS = 48;

  const [seedProducts, warehouses, branches, sales] = await Promise.all([
    productService.getProductsForPos(user.businessId, {
      limit: INITIAL_POS_PRODUCTS,
    }),
    warehousesService.getWarehouses(user.businessId),
    branchesService.getBranches(user.businessId),
    saleRepository.findRecent(user.businessId, 12),
  ]);

  const products = seedProducts;
  const productIds = (products as { id: string }[]).map((p) => p.id);
  const support = await loadPosSupport(user.businessId, productIds);

  const unitsByProduct = support.productUnitsByProduct as Record<
    string,
    {
      unitId: string;
      factorToStock: number;
      isSalesDefault: boolean;
      isStockUnit: boolean;
      label: string;
    }[]
  >;
  // Normalize label field
  for (const [pid, list] of Object.entries(support.productUnitsByProduct)) {
    unitsByProduct[pid] = list.map((u) => ({
      unitId: u.unitId,
      factorToStock: u.factorToStock,
      isSalesDefault: u.isSalesDefault,
      isStockUnit: u.isStockUnit,
      label: u.label || u.unitName || u.unitCode || "Unit",
    }));
  }

  const stockByProductWarehouse = support.stockByProductWarehouse;
  const serialsByProduct = support.serialsByProduct;
  const batchesByProductWarehouse = support.batchesByProductWarehouse;
  const pricesByProductUnit = support.unitPricesByProduct;

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
  for (const [pid, list] of Object.entries(serialsByProduct)) {
    const byWh: Record<string, string[]> = {};
    for (const s of list) {
      const wh = s.warehouseId ?? "_";
      byWh[wh] = byWh[wh] ?? [];
      byWh[wh].push(s.serialNumber);
    }
    serialsByProductWarehouse[pid] = byWh;
  }
  const availableSerials: Record<string, string[]> = {};
  for (const [pid, byWh] of Object.entries(serialsByProductWarehouse)) {
    availableSerials[pid] = Object.values(byWh).flat();
  }

  return (
    <PosClient
      cashAccounts={cashAccounts}

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
        // Never fall back to cost — avoid selling at cost/loss by default
        const retailPrice =
          Number.isFinite(retail) && retail > 0 ? retail : 0;
        const wholesalePrice =
          Number.isFinite(wholesale) && wholesale > 0
            ? wholesale
            : retailPrice > 0
              ? retailPrice
              : 0;
        const costPrice = Number(p.costPrice ?? 0);

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
          isControlled: Boolean((p as { isControlled?: boolean }).isControlled),
          trackBatch: Boolean((p as { trackBatch?: boolean }).trackBatch),
          trackExpiry: Boolean((p as { trackExpiry?: boolean }).trackExpiry),
          unitPrice: retailPrice,
          retailPrice,
          wholesalePrice,
          costPrice: Number.isFinite(costPrice) ? costPrice : 0,
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
