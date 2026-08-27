"use server";

import { revalidatePath } from "next/cache";

import {
  requireAuthorizedUser,
} from "@/lib/auth/authorize";

import {
  createProductSchema,
} from "../schemas/products";

import {
  productService,
} from "../services";

import {
  BusinessCapabilityRepository,
} from "@/features/capabilities/repositories";

import {
  productRuleResolver,
} from "../services/product-rule-resolver";

import {
  priceListRepository,
} from "@/repositories/inventory/price-lists.repository";

import {
  productPriceService,
} from "../services/product-prices.service";


export async function createProductAction(
  formData: FormData
) {

  const user =
    await requireAuthorizedUser(
      "products.create"
    );


  const parsed =
    createProductSchema.safeParse({

      // ----------------------------------------------------------------------
      // Classification
      // ----------------------------------------------------------------------
      productType:
  formData.get("productType"),

      categoryId:
        formData.get("categoryId"),

      supplierId:
        formData.get("supplierId") || null,

      manufacturerId:
        formData.get("manufacturerId") || null,

      drugCategoryId:
        formData.get("drugCategoryId") || null,

      dosageFormId:
        formData.get("dosageFormId") || null,

      drugStrengthId:
        formData.get("drugStrengthId") || null,

      prescriptionTypeId:
        formData.get("prescriptionTypeId") || null,


      // ----------------------------------------------------------------------
      // Units
      // ----------------------------------------------------------------------

      purchaseUnitId:
        formData.get("purchaseUnitId") || null,

      salesUnitId:
        formData.get("salesUnitId") || null,

      stockUnitId:
        formData.get("stockUnitId") || null,


      // ----------------------------------------------------------------------
      // Finance
      // ----------------------------------------------------------------------

      incomeAccountId:
        formData.get("incomeAccountId") || null,

      expenseAccountId:
        formData.get("expenseAccountId") || null,

      inventoryAccountId:
        formData.get("inventoryAccountId") || null,

      taxRateId:
        formData.get("taxRateId") || null,


      // ----------------------------------------------------------------------
      // Product Information
      // ----------------------------------------------------------------------

      name:
        formData.get("name"),

      genericName:
        formData.get("genericName") || null,

      productBrand:
        formData.get("productBrand") || null,

      description:
        formData.get("description") || null,

      sku:
        formData.get("sku") || null,

      barcode:
        formData.get("barcode") || null,

      packSize:
        formData.get("packSize") || null,

      costPrice:
        formData.get("costPrice") === null ||
        formData.get("costPrice") === ""
          ? null
          : Number(formData.get("costPrice")),


      // ----------------------------------------------------------------------
      // Inventory Behaviour
      // ----------------------------------------------------------------------

      trackInventory:
        formData.get("trackInventory") === "true",

      trackBatch:
        formData.get("trackBatch") === "true",

      trackExpiry:
        formData.get("trackExpiry") === "true",

      serialized:
        formData.get("serialized") === "true",

      allowNegativeStock:
        formData.get("allowNegativeStock") === "true",

      minimumStock:
        Number(
          formData.get("minimumStock") ?? 0
        ),

      reorderLevel:
        Number(
          formData.get("reorderLevel") ?? 0
        ),

      active:
        formData.get("active") === "true",

    });


  if (!parsed.success) {
    const fieldErrors = parsed.error.flatten().fieldErrors;
    const messages = Object.entries(fieldErrors)
      .flatMap(([key, msgs]) =>
        (msgs ?? []).map((m) => m),
      );
    return {
      success: false as const,
      message:
        messages[0] ??
        "Check required product fields and try again.",
      errors: fieldErrors,
    };
  }

  const businessCapabilityRepository = new BusinessCapabilityRepository();
  const businessCapabilities = await businessCapabilityRepository.listEnabled(user.businessId);
  const validationResult = productRuleResolver.validateInput({
    businessCapabilities,
    input: parsed.data,
  });

  if (!validationResult.valid) {
    const messages = Object.values(validationResult.errors).flat();
    return {
      success: false as const,
      message:
        messages[0] ??
        "Pharmacy catalogue fields are required for medicine products.",
      errors: validationResult.errors,
    };
  }

  const sellingPriceRaw = formData.get("sellingPrice");
  const sellingPrice =
    sellingPriceRaw !== null &&
    sellingPriceRaw !== undefined &&
    String(sellingPriceRaw).trim() !== ""
      ? Number(sellingPriceRaw)
      : null;

  try {

    const product = await productService.createProduct({

      ...parsed.data,

      businessId:
        user.businessId,

    });

    // Optional default selling price → product_prices on default price list
    if (
      sellingPrice !== null &&
      !Number.isNaN(sellingPrice) &&
      sellingPrice > 0
    ) {
      const defaultList =
        await priceListRepository.findDefault(user.businessId);

      if (!defaultList) {
        return {
          success: true,
          message:
            "Product created, but no default price list exists. Add a price list to set selling prices.",
        };
      }

      try {
        await productPriceService.createProductPrice({
          businessId: user.businessId,
          productId: product.id,
          priceListId: defaultList.id,
          price: sellingPrice.toFixed(2),
          minimumQuantity: "1",
          active: true,
        });
      } catch (priceError) {
        return {
          success: true,
          message:
            priceError instanceof Error
              ? `Product created, but selling price was not saved: ${priceError.message}`
              : "Product created, but selling price was not saved.",
        };
      }
    }

    revalidatePath(
      "/inventory/products"
    );
    revalidatePath(
      "/inventory/product-prices"
    );

    return {

      success: true,

      message:
        sellingPrice && sellingPrice > 0
          ? "Product created with default selling price."
          : "Product created successfully.",

    };


  } catch (error) {

    return {

      success: false,

      message:
        error instanceof Error
          ? error.message
          : "Failed to create product.",

    };

  }

}