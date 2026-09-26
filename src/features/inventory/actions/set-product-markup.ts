"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { db } from "@/db";
import { products } from "@/db/schema/inventory/products";
import { requireAuthorizedUser } from "@/lib/auth/authorize";
import { ensureProductCostingSchema } from "../services/ensure-product-costing-schema";

export async function setProductMarkupAction(input: {
  productId: string;
  markupPercent: number | null;
}) {
  const user = await requireAuthorizedUser("products.update");

  try {
    await ensureProductCostingSchema();
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    return {
      success: false as const,
      message: msg || "Could not prepare pricing columns.",
    };
  }

  const m = input.markupPercent;
  if (m != null && (!Number.isFinite(m) || m < 0 || m > 1000)) {
    return {
      success: false as const,
      message: "Markup % must be between 0 and 1000.",
    };
  }

  const existing = await db.query.products.findFirst({
    where: and(
      eq(products.id, input.productId),
      eq(products.businessId, user.businessId),
    ),
    columns: { id: true },
  });

  if (!existing) {
    return { success: false as const, message: "Product not found." };
  }

  await db
    .update(products)
    .set({
      markupPercent: m == null ? null : String(m),
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(products.id, input.productId),
        eq(products.businessId, user.businessId),
      ),
    );

  revalidatePath("/inventory/products");
  revalidatePath("/inventory/product-prices");
  revalidatePath("/inventory/categories");

  return {
    success: true as const,
    message:
      m == null
        ? "Product markup cleared (will use category)."
        : `Product markup set to ${m}%.`,
  };
}
