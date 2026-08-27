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
        message: "Stock unit factor must be 1.",
      };
    }

    if (data.supersede) {
      await productUnitRepository.supersedeFactor({
        businessId: user.businessId,
        productId: data.productId,
        unitId: data.unitId,
        newFactor: data.factorToStock,
      });
    } else {
      const existing = await productUnitRepository.listByProduct(
        user.businessId,
        data.productId,
      );
      const match = existing.find((u) => u.unitId === data.unitId);
      if (match && Number(match.factorToStock) !== data.factorToStock) {
        return {
          success: false as const,
          message:
            "Factor already set. Use supersede to change packaging without rewriting history.",
        };
      }
      if (!match) {
        await productUnitRepository.create({
          businessId: user.businessId,
          productId: data.productId,
          unitId: data.unitId,
          factorToStock: String(data.factorToStock),
          isStockUnit: data.isStockUnit,
          isPurchaseDefault: data.isPurchaseDefault,
          isSalesDefault: data.isSalesDefault,
          allowPurchase: data.allowPurchase,
          allowSale: data.allowSale,
          active: true,
        });
      }
    }

    revalidatePath("/inventory/products");
    return { success: true as const, message: "Product unit saved." };
  } catch (error) {
    return {
      success: false as const,
      message: error instanceof Error ? error.message : "Failed to save unit.",
    };
  }
}

export async function listProductUnitsAction(productId: string) {
  const user = await requireAuthorizedUser("products.read");
  const rows = await productUnitRepository.listByProduct(
    user.businessId,
    productId,
  );
  return { success: true as const, units: rows };
}
