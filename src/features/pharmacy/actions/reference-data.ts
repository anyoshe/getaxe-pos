"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireAuthorizedUser } from "@/lib/auth/authorize";
import { pharmacyReferenceRepository } from "@/repositories/pharmacy/reference-data.repository";

export async function createManufacturerAction(input: unknown) {
  const user = await requireAuthorizedUser("products.update");
  const parsed = z
    .object({
      name: z.string().trim().min(1),
      country: z.string().trim().optional().nullable(),
    })
    .safeParse(input);

  if (!parsed.success) {
    return { success: false as const, message: "Name is required." };
  }

  try {
    await pharmacyReferenceRepository.createManufacturer({
      businessId: user.businessId,
      name: parsed.data.name,
      country: parsed.data.country ?? null,
    });
    revalidatePath("/inventory/manufacturers");
    revalidatePath("/inventory/products");
    return { success: true as const, message: "Manufacturer created." };
  } catch (error) {
    return {
      success: false as const,
      message: error instanceof Error ? error.message : "Failed to create.",
    };
  }
}

export async function createDosageFormAction(input: unknown) {
  const user = await requireAuthorizedUser("products.update");
  const parsed = z
    .object({
      code: z.string().trim().min(1),
      name: z.string().trim().min(1),
    })
    .safeParse(input);

  if (!parsed.success) {
    return { success: false as const, message: "Code and name required." };
  }

  try {
    await pharmacyReferenceRepository.createDosageForm({
      businessId: user.businessId,
      code: parsed.data.code,
      name: parsed.data.name,
    });
    revalidatePath("/inventory/pharmacy-catalogues");
    revalidatePath("/inventory/products");
    return { success: true as const, message: "Dosage form created." };
  } catch (error) {
    return {
      success: false as const,
      message: error instanceof Error ? error.message : "Failed.",
    };
  }
}

export async function createDrugCategoryAction(input: unknown) {
  const user = await requireAuthorizedUser("products.update");
  const parsed = z
    .object({
      code: z.string().trim().min(1),
      name: z.string().trim().min(1),
    })
    .safeParse(input);

  if (!parsed.success) {
    return { success: false as const, message: "Code and name required." };
  }

  try {
    await pharmacyReferenceRepository.createDrugCategory({
      businessId: user.businessId,
      code: parsed.data.code,
      name: parsed.data.name,
    });
    revalidatePath("/inventory/pharmacy-catalogues");
    revalidatePath("/inventory/products");
    return { success: true as const, message: "Drug category created." };
  } catch (error) {
    return {
      success: false as const,
      message: error instanceof Error ? error.message : "Failed.",
    };
  }
}

export async function createDrugStrengthAction(input: unknown) {
  const user = await requireAuthorizedUser("products.update");
  const parsed = z
    .object({
      code: z.string().trim().min(1),
      name: z.string().trim().min(1),
    })
    .safeParse(input);

  if (!parsed.success) {
    return { success: false as const, message: "Code and name required." };
  }

  try {
    await pharmacyReferenceRepository.createDrugStrength({
      businessId: user.businessId,
      code: parsed.data.code,
      name: parsed.data.name,
    });
    revalidatePath("/inventory/pharmacy-catalogues");
    revalidatePath("/inventory/products");
    return { success: true as const, message: "Drug strength created." };
  } catch (error) {
    return {
      success: false as const,
      message: error instanceof Error ? error.message : "Failed.",
    };
  }
}

export async function createPrescriptionTypeAction(input: unknown) {
  const user = await requireAuthorizedUser("products.update");
  const parsed = z
    .object({
      code: z.string().trim().min(1),
      name: z.string().trim().min(1),
      dispensingLevel: z
        .enum(["OTC", "PRESCRIPTION", "CONTROLLED", "NARCOTIC"])
        .optional(),
    })
    .safeParse(input);

  if (!parsed.success) {
    return { success: false as const, message: "Code and name required." };
  }

  try {
    await pharmacyReferenceRepository.createPrescriptionType({
      businessId: user.businessId,
      code: parsed.data.code,
      name: parsed.data.name,
      dispensingLevel: parsed.data.dispensingLevel,
    });
    revalidatePath("/inventory/pharmacy-catalogues");
    revalidatePath("/inventory/products");
    return { success: true as const, message: "Prescription type created." };
  } catch (error) {
    return {
      success: false as const,
      message: error instanceof Error ? error.message : "Failed.",
    };
  }
}
