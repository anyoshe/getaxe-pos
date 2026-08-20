"use server";

import { revalidatePath } from "next/cache";
import { requireAuthorizedUser } from "@/lib/auth/authorize";
import { BusinessCapabilityRepository } from "@/features/capabilities/repositories";
import { createProductSchema } from "../schemas/products";
import { productService } from "../services";
import { productRuleResolver } from "../services/product-rule-resolver";

export async function createProductsBatchAction(items: unknown[]) {
  const user = await requireAuthorizedUser("products.create");
  if (!Array.isArray(items) || items.length === 0) {
    return {
      success: false as const,
      message: "Add at least one product.",
      results: [] as Array<{ index: number; success: boolean; message: string }>,
    };
  }
  if (items.length > 100) {
    return {
      success: false as const,
      message: "Maximum 100 products per batch.",
      results: [],
    };
  }
  const businessCapabilityRepository = new BusinessCapabilityRepository();
  const businessCapabilities =
    await businessCapabilityRepository.listEnabled(user.businessId);
  const results: Array<{ index: number; success: boolean; message: string }> = [];
  let created = 0;
  for (let index = 0; index < items.length; index++) {
    const parsed = createProductSchema.safeParse(items[index]);
    if (!parsed.success) {
      results.push({ index, success: false, message: "Validation failed." });
      continue;
    }
    const capabilityCheck = productRuleResolver.validateInput({
      businessCapabilities,
      input: parsed.data,
    });
    if (!capabilityCheck.valid) {
      const messages = Object.values(capabilityCheck.errors).flat();
      results.push({
        index,
        success: false,
        message: messages.join(" ") || "Capability validation failed.",
      });
      continue;
    }
    try {
      await productService.createProduct({
        ...parsed.data,
        businessId: user.businessId,
      });
      created += 1;
      results.push({ index, success: true, message: "Created." });
    } catch (error) {
      results.push({
        index,
        success: false,
        message: error instanceof Error ? error.message : "Failed to create product.",
      });
    }
  }
  revalidatePath("/inventory/products");
  return {
    success: created > 0,
    message:
      created === items.length
        ? `${created} product(s) created.`
        : `${created} of ${items.length} product(s) created.`,
    results,
  };
}
