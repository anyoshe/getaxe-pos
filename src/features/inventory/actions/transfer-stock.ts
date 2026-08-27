"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireAuthorizedUser } from "@/lib/auth/authorize";
import { productUnitRepository } from "@/repositories/inventory/product-units.repository";
import { resolveToStock } from "../services/unit-conversion.service";
import { inventoryService } from "../services/inventory.service";

const schema = z.object({
  productId: z.uuid(),
  batchId: z.uuid(),
  fromWarehouseId: z.uuid(),
  toWarehouseId: z.uuid(),
  quantity: z.coerce.number().positive(),
  unitId: z.uuid().nullable().optional(),
  notes: z.string().trim().nullable().optional(),
  reference: z.string().trim().nullable().optional(),
});

export async function transferStockAction(input: unknown) {
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

  if (data.fromWarehouseId === data.toWarehouseId) {
    return {
      success: false as const,
      message: "Source and destination warehouse must differ.",
    };
  }

  let quantityStock = data.quantity;

  try {
    const productUnits = await productUnitRepository.listByProduct(
      user.businessId,
      data.productId,
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
        quantityEntered: data.quantity,
        allowDecimals: true,
      });
      quantityStock = resolved.quantityStock;
    }
  } catch (err) {
    return {
      success: false as const,
      message: err instanceof Error ? err.message : "Unit conversion failed.",
    };
  }

  try {
    await inventoryService.transferStock({
      productId: data.productId,
      batchId: data.batchId,
      fromWarehouseId: data.fromWarehouseId,
      toWarehouseId: data.toWarehouseId,
      quantity: quantityStock,
      movement: {
        userId: user.id,
        reference: data.reference ?? null,
        notes: data.notes ?? null,
      },
    });

    revalidatePath("/inventory/stock");
    revalidatePath("/inventory/stock-movements");
    revalidatePath("/inventory/transfers");

    return {
      success: true as const,
      message: `Transferred ${quantityStock} stock unit(s).`,
    };
  } catch (error) {
    return {
      success: false as const,
      message: error instanceof Error ? error.message : "Transfer failed.",
    };
  }
}
