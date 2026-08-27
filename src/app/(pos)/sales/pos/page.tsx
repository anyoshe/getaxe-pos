import { getCurrentUser } from "@/lib/auth/current-user";
import { productService } from "@/features/inventory/services";
import { warehousesService } from "@/features/settings/services/warehouses.service";
import { branchesService } from "@/features/settings/services/branches.service";
import { saleRepository } from "@/repositories/sales/sales.repository";
import { productSerials } from "@/db/schema/inventory/product_serials";
import { db } from "@/db";
import { and, eq, isNull } from "drizzle-orm";
import { productUnits } from "@/db/schema/inventory/product_units";
import { units } from "@/db/schema/settings/units";
import { PosClient } from "@/features/sales/components/pos/pos-client";

export default async function FullScreenPosPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const [products, warehouses, branches, sales, availableSerialRows, productUnitRows] =
    await Promise.all([
      productService.getProducts(user.businessId),
      warehousesService.getWarehouses(user.businessId),
      branchesService.getBranches(user.businessId),
      saleRepository.findRecent(user.businessId, 12),
      db
        .select({
          productId: productSerials.productId,
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
            eq(productUnits.allowSale, true),
            isNull(productUnits.validTo),
          ),
        ),
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

  const availableSerials: Record<string, string[]> = {};
  for (const row of availableSerialRows) {
    const list = availableSerials[row.productId] ?? [];
    list.push(row.serialNumber);
    availableSerials[row.productId] = list;
  }

  return (
    <PosClient
      fullScreen
      cashierName={user.name ?? user.email}
      recentSales={sales.map((s) => ({
        id: s.id,
        invoiceNumber: s.invoiceNumber,
        total: Number(s.total ?? 0),
        soldAt: s.soldAt.toISOString?.() ?? String(s.soldAt),
      }))}
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

        return {
          id: p.id,
          name: p.name,
          sku: p.sku ?? null,
          barcode: p.barcode ?? null,
          productType: p.productType,
          trackInventory: p.trackInventory,
          serialized: Boolean(p.serialized),
          retailPrice,
          wholesalePrice,
          unitPrice: retailPrice,
          active: p.active !== false,
        };
      })}
      warehouses={warehouses.map((w) => ({
        id: w.id,
        name: w.name,
        branchId: w.branchId,
      }))}
      branches={branches.map((b) => ({ id: b.id, name: b.name }))}
      availableSerials={availableSerials}
      productUnitsByProduct={unitsByProduct}
    />
  );
}
