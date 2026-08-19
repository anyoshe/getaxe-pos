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

    return {
      success: false,

      errors:
        parsed.error.flatten()
          .fieldErrors,
    };

  }


  try {

    await productService.createProduct({

      ...parsed.data,

      businessId:
        user.businessId,

    });


    revalidatePath(
      "/inventory/products"
    );


    return {

      success: true,

      message:
        "Product created successfully.",

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