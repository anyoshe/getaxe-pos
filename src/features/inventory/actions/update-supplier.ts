"use server";

import { revalidatePath } from "next/cache";

import { requireAuthorizedUser } from "@/lib/auth/authorize";

import {
  createSupplierSchema,
} from "../schemas";

import {
  supplierService,
} from "../services";

export async function updateSupplierAction(
  id: string,
  formData: FormData
) {
  const user =
  await requireAuthorizedUser(
    "suppliers.update"
  );

  const parsed =
    createSupplierSchema.safeParse({
      businessId:
        formData.get("businessId"),

      name:
        formData.get("name"),

      contactPerson:
        formData.get("contactPerson") ||
        null,

      email:
        formData.get("email") ||
        null,

      phone:
        formData.get("phone") ||
        null,

      kraPin:
        formData.get("kraPin") ||
        null,

      address:
        formData.get("address") ||
        null,

      town:
        formData.get("town") ||
        null,

      notes:
        formData.get("notes") ||
        null,

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
    await supplierService.updateSupplier(
  id,
  parsed.data,
  user.businessId
);

    revalidatePath(
      "/inventory/suppliers"
    );

    return {
      success: true,
      message:
        "Supplier updated successfully.",
    };
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to update supplier.",
    };
  }
}