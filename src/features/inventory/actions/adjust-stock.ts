"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireAuthorizedUser } from "@/lib/auth/authorize";
import { productBatchRepository } from "@/repositories/inventory/product-batches.repository";
import { productUnitRepository } from "@/repositories/inventory/product-units.repository";
import { resolveToStock } from "../services/unit-conversion.service";
import { inventoryService } from "../services/inventory.service";

const schema = z.object({
  batchId: z.uuid(),
  warehouseId: z.uuid(),
  quantity: z.coerce
    .number()
    .refine((n) => n !== 0, "Quantity cannot be zero"),
  unitId: z.uuid().nullable().optional(),
  notes: z.string().trim().nullable().optional(),
  reference: z.string().trim().nullable().optional(),
});

export async function adjustStockAction(input: unknown) {
  const user = await requireAuthorizedUser("stock_adjustments.create");
  const parsed = schema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false as const,
      message: "Check the form and try again.",
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  const data = parsed.data;

  const batch = await productBatchRepository.findById(
    data.batchId,
    user.businessId,
  );

  if (!batch) {
    return { success: false as const, message: "Batch not found." };
  }

  const signedEntered = data.quantity;
  const absEntered = Math.abs(signedEntered);
  let quantityStock = absEntered;
  let conversionFactor = 1;
  let enteredUnitId = data.unitId ?? null;

  try {
    const productUnits = await productUnitRepository.listByProduct(
      user.businessId,
      batch.productId,
    );
    if (productUnits.length > 0 && data.unitId) {
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
        unitId: data.unitId,
        quantityEntered: absEntered,
        allowDecimals: true,
      });
      quantityStock = resolved.quantityStock;
      conversionFactor = resolved.factorToStock;
      enteredUnitId = resolved.unitId;
    }
  } catch (err) {
    return {
      success: false as const,
      message: err instanceof Error ? err.message : "Unit conversion failed.",
    };
  }

  const signedStock =
    signedEntered < 0 ? -quantityStock : quantityStock;

  try {
    await inventoryService.adjustStock({
      batchId: data.batchId,
      warehouseId: data.warehouseId,
      quantity: signedStock,
      movement: {
        businessId: user.businessId,
        productId: batch.productId,
        warehouseId: data.warehouseId,
        userId: user.id,
        movementType: "ADJUSTMENT",
        quantity: String(signedStock),
        enteredUnitId,
        quantityEntered: String(signedEntered),
        conversionFactor: String(conversionFactor),
        reference: data.reference ?? null,
        notes: data.notes ?? null,
      },
    });

    revalidatePath("/inventory/stock");
    revalidatePath("/inventory/stock-movements");
    revalidatePath("/inventory/adjustments");
    revalidatePath("/inventory/batches");

    return {
      success: true as const,
      message: `Stock adjusted by ${signedStock} stock unit(s).`,
    };
  } catch (error) {
    return {
      success: false as const,
      message: error instanceof Error ? error.message : "Adjustment failed.",
    };
  }
}
