"use server";

import { revalidatePath } from "next/cache";

import { getCurrentUser } from "@/lib/auth/current-user";

import { createBranchSchema } from "../schemas/branch";
import { branchesService } from "../services/branches.service";

export async function createBranchAction(formData: FormData) {
  const user = await getCurrentUser();

  if (!user) {
    return {
      success: false,
      message: "Unauthorized",
    };
  }

  const parsed = createBranchSchema.safeParse({
    businessId: user.businessId,

    code: formData.get("code"),
    name: formData.get("name"),
    phone: formData.get("phone") || null,
    email: formData.get("email") || null,
    county: formData.get("county") || null,
    town: formData.get("town") || null,
    address: formData.get("address") || null,

    active: true,
    isHeadOffice: formData.get("isHeadOffice") === "on",
  });

  if (!parsed.success) {
    return {
      success: false,
      errors: parsed.error.flatten().fieldErrors,
    };
  }

 try {
  await branchesService.createBranch(parsed.data);

  revalidatePath("/settings/branches");

  return {
    success: true,
    message: "Branch created successfully.",
  };
} catch (error) {
  return {
    success: false,
    message:
      error instanceof Error
        ? error.message
        : "Failed to create branch.",
  };
}
}