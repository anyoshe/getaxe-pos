"use server";

import { qtyStr } from "@/lib/quantity";
import { revalidatePath } from "next/cache";

import { requireAuthorizedUser } from "@/lib/auth/authorize";
import { productRepository } from "@/repositories/inventory/products.repository";
import { inventoryService } from "../services/inventory.service";
import { receiveStockSchema } from "../schemas/receive-stock";
import { productUnitRepository } from "@/repositories/inventory/product-units.repository";
import {
  resolveToStock,
  costPerStockUnit,
} from "../services/unit-conversion.service";

/**
 * Ad-hoc stock receive (opening stock / purchase without full GRN).
 * Respects product.trackBatch / trackExpiry / trackInventory / serialized flags.
 */
export async function receiveStockAction(input: unknown) {
  const user = await requireAuthorizedUser("stock_adjustments.create");

  const parsed = receiveStockSchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false as const,
      message: "Check the form and try again.",
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  const data = parsed.data;

  const product = await productRepository.findById(
    data.productId,
    user.businessId,
  );

  if (!product) {
    return {
      success: false as const,
      message: "Product not found.",
    };
  }

  if (!product.trackInventory) {
    return {
      success: false as const,
      message:
        "This product does not track inventory. Enable Track inventory on the product first.",
    };
  }

  if (product.productType === "service") {
    return {
      success: false as const,
      message: "Service products cannot receive stock.",
    };
  }

  let batchNumber = data.batchNumber?.trim() || null;

  if (product.trackBatch) {
    if (!batchNumber) {
      return {
        success: false as const,
        message: "Batch number is required for this product.",
        errors: { batchNumber: ["Batch number is required."] },
      };
    }
  } else {
    batchNumber =
      batchNumber ||
      `AUTO-${Date.now().toString(36).toUpperCase()}`;
  }

  if (product.trackExpiry) {
    if (!data.expiryDate) {
      return {
        success: false as const,
        message: "Expiry date is required for this product.",
        errors: { expiryDate: ["Expiry date is required."] },
      };
    }
  }

  if (
    data.manufactureDate &&
    data.expiryDate &&
    data.expiryDate < data.manufactureDate
  ) {
    return {
      success: false as const,
      message: "Expiry cannot be earlier than manufacture date.",
    };
  }

  // Normalize entered qty → stock units
  let quantityStock = Math.round(Number(data.quantity));
  let quantityEntered = Number(data.quantity);
  let conversionFactor = 1;
  let enteredUnitId: string | null =
    data.unitId ?? product.purchaseUnitId ?? product.stockUnitId ?? null;
  let unitCostStock =
    data.unitCost != null ? Number(data.unitCost) : null;

  try {
    const productUnits = await productUnitRepository.listByProduct(
      user.businessId,
      product.id,
    );
    if (productUnits.length > 0) {
      const resolved = resolveToStock({
        productUnits: productUnits.map((u) => ({
          unitId: u.unitId,
          factorToStock: Number(u.factorToStock),
          isStockUnit: u.isStockUnit,
          allowSale: u.allowSale,
          allowPurchase: u.allowPurchase,
          active: u.active,
          validTo: u.validTo,
        })),
        unitId: data.unitId ?? product.purchaseUnitId ?? undefined,
        quantityEntered: Number(data.quantity),
        requirePurchase: true,
      });
      quantityStock = resolved.quantityStock;
      quantityEntered = resolved.quantityEntered;
      conversionFactor = resolved.factorToStock;
      enteredUnitId = resolved.unitId;
      if (data.unitCost != null) {
        unitCostStock = costPerStockUnit(Number(data.unitCost), conversionFactor);
      }
    }
  } catch (err) {
    return {
      success: false as const,
      message:
        err instanceof Error ? err.message : "Unit conversion failed on receive.",
    };
  }

  if (product.serialized && conversionFactor !== 1) {
    return {
      success: false as const,
      message:
        "Serialized products must be received in stock units (conversion factor 1).",
    };
  }

  const serialNumbers = (data.serialNumbers ?? [])
    .map((s) => s.trim())
    .filter(Boolean);

  if (product.serialized) {
    if (serialNumbers.length !== quantityStock) {
      return {
        success: false as const,
        message: `This product is serialized. Enter exactly ${quantityStock} serial number(s).`,
        errors: {
          serialNumbers: [
            `Expected ${quantityStock} serial numbers, got ${serialNumbers.length}.`,
          ],
        },
      };
    }

    if (new Set(serialNumbers).size !== serialNumbers.length) {
      return {
        success: false as const,
        message: "Duplicate serial numbers in this receipt.",
        errors: { serialNumbers: ["Serial numbers must be unique."] },
      };
    }
  } else if (serialNumbers.length > 0) {
    return {
      success: false as const,
      message: "This product is not serialized. Clear serial numbers or enable Serialized on the product.",
    };
  }

  try {
    const result = (await inventoryService.receiveStock({
      warehouseId: data.warehouseId,
      serialNumbers: product.serialized ? serialNumbers : [],
      batch: {
        businessId: user.businessId,
        productId: product.id,
        supplierId: data.supplierId ?? product.supplierId ?? null,
        batchNumber: (batchNumber && String(batchNumber).trim()) || `RCV-${Date.now().toString(36).toUpperCase()}`,
        manufactureDate: data.manufactureDate ?? null,
        expiryDate: data.expiryDate ?? null,
        purchaseInvoice: data.reference ?? null,
        costPrice: (unitCostStock ?? data.unitCost ?? product.costPrice ?? 0).toString(),
        sellingPrice: null,
        quantityReceived: qtyStr(quantityStock),
        quantityRemaining: qtyStr(quantityStock),
        active: true,
      },
      movement: {
        businessId: user.businessId,
        productId: product.id,
        warehouseId: data.warehouseId,
        userId: user.id,
        movementType: data.movementType,
        quantity: qtyStr(quantityStock),
        enteredUnitId,
        quantityEntered: String(quantityEntered),
        conversionFactor: String(conversionFactor),
        unitCost:
          unitCostStock != null
            ? unitCostStock.toFixed(4)
            : data.unitCost != null
              ? data.unitCost.toString()
              : product.costPrice != null
                ? String(product.costPrice)
                : null,
        reference: data.reference ?? null,
        notes: data.notes ?? null,
      },
    }));

    revalidatePath("/inventory/stock");
    revalidatePath("/inventory/stock-movements");
    revalidatePath("/inventory/products");

    return {
      success: true as const,
      message: product.serialized
        ? `Received ${data.quantity} of ${product.name} with ${serialNumbers.length} serial(s).`
        : `Received ${data.quantity} of ${product.name}.`,
      batchId: (result as { batch: { id: string } }).batch.id,
      movementId: (result as { movement: { id: string } }).movement.id,
      serialCount: (result as { serials?: unknown[] }).serials?.length ?? 0,
    };
  } catch (error) {
    return {
      success: false as const,
      message:
        error instanceof Error
          ? error.message
          : "Failed to receive stock.",
    };
  }
}
