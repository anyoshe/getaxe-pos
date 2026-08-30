"use server";

import { requireAuthorizedUser } from "@/lib/auth/authorize";
import { productRepository } from "@/repositories/inventory/products.repository";
import { warehousesRepository } from "@/repositories/settings/warehouses.repository";
import { unitsRepository } from "@/repositories/settings/units.repository";
import { productUnitRepository } from "@/repositories/inventory/product-units.repository";
import { resolveToStock } from "../services/unit-conversion.service";

export type OpeningStockRowResult = {
  index: number;
  ok: boolean;
  errors: string[];
  payload?: {
    productId: string;
    warehouseId: string;
    quantity: number;
    unitId: string | null;
    unitCost: number | null;
    movementType: "OPENING_STOCK";
    reference: string | null;
    notes: string | null;
    batchNumber: string | null;
    expiryDate: string | null;
    manufactureDate: string | null;
    supplierId: string | null;
    serialNumbers: string[];
  };
  preview?: {
    product: string;
    sku: string;
    warehouse: string;
    quantity: string;
  };
};

function norm(s: string | undefined | null) {
  return (s ?? "").trim().toLowerCase();
}

function parseDate(v: string | undefined): string | null {
  if (!v || !String(v).trim()) return null;
  const s = String(v).trim();
  // Accept YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
  // DD/MM/YYYY
  const m = s.match(/^(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{4})$/);
  if (m) {
    const d = m[1].padStart(2, "0");
    const mo = m[2].padStart(2, "0");
    return `${m[3]}-${mo}-${d}`;
  }
  return null;
}

export async function validateOpeningStockImportAction(
  rows: Record<string, string>[],
) {
  const user = await requireAuthorizedUser("stock_adjustments.create");

  if (!Array.isArray(rows) || rows.length === 0) {
    return {
      success: false as const,
      message: "No rows to validate.",
      results: [] as OpeningStockRowResult[],
    };
  }
  if (rows.length > 200) {
    return {
      success: false as const,
      message: "Maximum 200 rows per upload.",
      results: [],
    };
  }

  const [products, warehouses, units] = await Promise.all([
    productRepository.findAll(user.businessId),
    warehousesRepository.findAll(user.businessId),
    unitsRepository.findAll(user.businessId),
  ]);

  const bySku = new Map<string, (typeof products)[0]>();
  const byBarcode = new Map<string, (typeof products)[0]>();
  for (const p of products) {
    if (p.sku) bySku.set(norm(p.sku), p);
    if (p.barcode) byBarcode.set(norm(p.barcode), p);
  }

  const results: OpeningStockRowResult[] = [];

  for (let index = 0; index < rows.length; index++) {
    const row = rows[index] ?? {};
    const errors: string[] = [];

    const product =
      (row.sku ? bySku.get(norm(row.sku)) : undefined) ||
      (row.barcode ? byBarcode.get(norm(row.barcode)) : undefined);

    if (!product) {
      errors.push(
        row.sku || row.barcode
          ? `Product not found for SKU/barcode "${row.sku || row.barcode}". Import catalogue first.`
          : "SKU or barcode is required.",
      );
    } else {
      if (!product.trackInventory) {
        errors.push(`"${product.name}" does not track inventory.`);
      }
      if (product.productType === "service") {
        errors.push(`"${product.name}" is a service and cannot hold stock.`);
      }
    }

    const whCode = (row.warehouse || "MAIN").trim();
    const warehouse =
      warehouses.find((w) => norm(w.code) === norm(whCode)) ||
      warehouses.find((w) => norm(w.name) === norm(whCode));

    if (!warehouse) {
      errors.push(`Warehouse "${whCode}" not found (use code e.g. MAIN).`);
    }

    const qty = Number(row.quantity);
    if (!Number.isFinite(qty) || qty <= 0) {
      errors.push("Quantity must be a positive number.");
    }

    let unitId: string | null = null;
    if (product && row.unit) {
      const u =
        units.find((x) => norm(x.code) === norm(row.unit)) ||
        units.find((x) => norm(x.name) === norm(row.unit));
      if (!u) errors.push(`Unit "${row.unit}" not found.`);
      else unitId = u.id;
    } else if (product) {
      unitId = product.stockUnitId ?? product.purchaseUnitId ?? null;
    }

    const unitCostRaw = row.unitCost?.trim();
    const unitCost =
      unitCostRaw && Number.isFinite(Number(unitCostRaw))
        ? Number(unitCostRaw)
        : null;

    const batchNumber = row.batchNumber?.trim() || null;
    const manufactureDate = parseDate(row.manufactureDate);
    const expiryDate = parseDate(row.expiryDate);

    if (row.manufactureDate && !manufactureDate) {
      errors.push("manufactureDate must be YYYY-MM-DD or DD/MM/YYYY.");
    }
    if (row.expiryDate && !expiryDate) {
      errors.push("expiryDate must be YYYY-MM-DD or DD/MM/YYYY.");
    }
    if (manufactureDate && expiryDate && expiryDate < manufactureDate) {
      errors.push("Expiry cannot be before manufacture date.");
    }

    if (product?.trackBatch && !batchNumber) {
      errors.push(`Batch number required for "${product.name}".`);
    }
    if (product?.trackExpiry && !expiryDate) {
      errors.push(`Expiry date required for "${product.name}".`);
    }

    const serialNumbers = (row.serialNumbers || "")
      .split(/[|;,\n]+/)
      .map((s) => s.trim())
      .filter(Boolean);

    let quantityStock = qty;
    if (product && Number.isFinite(qty) && qty > 0) {
      try {
        const productUnits = await productUnitRepository.listByProduct(
          user.businessId,
          product.id,
        );
        const factors = productUnits.map((u) => ({
          unitId: u.unitId,
          factorToStock: Number(u.factorToStock),
          isStockUnit: u.isStockUnit,
          allowSale: u.allowSale,
          allowPurchase: u.allowPurchase,
          active: u.active !== false,
        }));
        const unitConfigured =
          unitId && factors.some((f) => f.unitId === unitId);
        if (factors.length > 0 && unitConfigured) {
          const resolved = resolveToStock({
            productUnits: factors,
            unitId,
            quantityEntered: qty,
          });
          quantityStock = resolved.quantityStock;
        }
      } catch (e) {
        errors.push(
          e instanceof Error
            ? e.message
            : "Could not convert quantity to stock units.",
        );
      }
    }

    if (product?.serialized) {
      if (serialNumbers.length === 0) {
        errors.push(
          `Serial numbers required for "${product.name}" (use | between serials).`,
        );
      } else if (
        Math.round(quantityStock) !== serialNumbers.length
      ) {
        errors.push(
          `Expected ${Math.round(quantityStock)} serial(s) for stock qty, got ${serialNumbers.length}.`,
        );
      }
      if (new Set(serialNumbers).size !== serialNumbers.length) {
        errors.push("Duplicate serial numbers in this row.");
      }
    } else if (serialNumbers.length > 0) {
      errors.push(
        `"${product?.name ?? "Product"}" is not serialized — clear serialNumbers.`,
      );
    }

    const payload =
      product &&
      warehouse &&
      errors.length === 0 &&
      Number.isFinite(qty) &&
      qty > 0
        ? {
            productId: product.id,
            warehouseId: warehouse.id,
            quantity: qty,
            unitId,
            unitCost,
            movementType: "OPENING_STOCK" as const,
            reference: row.reference?.trim() || "OPENING",
            notes: row.notes?.trim() || "Opening stock import",
            batchNumber,
            expiryDate,
            manufactureDate,
            supplierId: product.supplierId ?? null,
            serialNumbers,
          }
        : undefined;

    results.push({
      index,
      ok: errors.length === 0 && Boolean(payload),
      errors,
      payload,
      preview: {
        product: product?.name ?? "—",
        sku: product?.sku ?? row.sku ?? row.barcode ?? "—",
        warehouse: warehouse?.code ?? whCode,
        quantity: Number.isFinite(qty) ? String(qty) : row.quantity || "—",
      },
    });
  }

  const okCount = results.filter((r) => r.ok).length;
  return {
    success: true as const,
    message: `${okCount} of ${results.length} row(s) ready to receive.`,
    results,
  };
}
