"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireAuthorizedUser } from "@/lib/auth/authorize";
import { productUnitRepository } from "@/repositories/inventory/product-units.repository";
import { assertValidFactor } from "../services/unit-conversion.service";

const upsertSchema = z.object({
  productId: z.uuid(),
  unitId: z.uuid(),
  factorToStock: z.coerce.number().positive(),
  isStockUnit: z.boolean().optional().default(false),
  isPurchaseDefault: z.boolean().optional().default(false),
  isSalesDefault: z.boolean().optional().default(false),
  allowPurchase: z.boolean().optional().default(true),
  allowSale: z.boolean().optional().default(true),
  /** If true, close previous factor and insert new (never rewrite history). */
  supersede: z.boolean().optional().default(false),
});

export async function upsertProductUnitAction(input: unknown) {
  const user = await requireAuthorizedUser("products.update");
  const parsed = upsertSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false as const,
      message: "Invalid product unit data.",
    };
  }

  const data = parsed.data;
  try {
    assertValidFactor(data.factorToStock);
    if (data.isStockUnit && data.factorToStock !== 1) {
      return {
        success: false as const,
        message: "Stock unit factor must be 1 (one piece = one stock unit).",
      };
    }
    if (!data.isStockUnit && data.factorToStock <= 1) {
      return {
        success: false as const,
        message:
          "A pack unit (strip/box) must contain more than 1 stock piece. Example: 1 box = 50 tablets → factor 50.",
      };
    }

    const existing = await productUnitRepository.listByProduct(
      user.businessId,
      data.productId,
    );
    const match = existing.find((u) => u.unitId === data.unitId);
    const flags = {
      isStockUnit: data.isStockUnit,
      isPurchaseDefault: data.isPurchaseDefault,
      isSalesDefault: data.isSalesDefault,
      allowPurchase: data.allowPurchase,
      allowSale: data.allowSale,
    };

    if (!match) {
      await productUnitRepository.create({
        businessId: user.businessId,
        productId: data.productId,
        unitId: data.unitId,
        factorToStock: String(data.factorToStock),
        ...flags,
        active: true,
      });
      revalidatePath("/inventory/products");
      return { success: true as const, message: "Packaging unit added." };
    }

    const prevFactor = Number(match.factorToStock);
    if (prevFactor !== data.factorToStock || data.supersede) {
      // Close old factor version; do not rewrite historical movements
      await productUnitRepository.supersedeFactor({
        businessId: user.businessId,
        productId: data.productId,
        unitId: data.unitId,
        newFactor: data.factorToStock,
        ...flags,
      });
      revalidatePath("/inventory/products");
      return {
        success: true as const,
        message: `Packaging updated: was ${prevFactor} pieces per unit, now ${data.factorToStock}. Past stock moves keep the old factor.`,
      };
    }

    await productUnitRepository.updateFlags({
      businessId: user.businessId,
      productId: data.productId,
      unitId: data.unitId,
      ...flags,
    });
    revalidatePath("/inventory/products");
    return { success: true as const, message: "Packaging unit flags updated." };
  } catch (error) {
    return {
      success: false as const,
      message: error instanceof Error ? error.message : "Failed to save unit.",
    };
  }
}

export async function listProductUnitsAction(productId: string) {
  const user = await requireAuthorizedUser("products.view");
  const rows = await productUnitRepository.listByProduct(
    user.businessId,
    productId,
  );
  return { success: true as const, units: rows };
}
