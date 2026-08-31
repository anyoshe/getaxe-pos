"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireAuthorizedUser } from "@/lib/auth/authorize";
import { BusinessCapabilityRepository } from "@/features/capabilities/repositories";
import { dispensingRepository } from "@/repositories/pharmacy/dispensing.repository";
import { dispensingService } from "../services/dispensing.service";

async function requireDispenseCap(businessId: string) {
  const caps = await new BusinessCapabilityRepository().listEnabled(businessId);
  if (!caps.includes("pharmacy.dispensing")) {
    throw new Error(
      "Medicine dispensing is not enabled. Enable pharmacy.dispensing under Capabilities.",
    );
  }
}

export async function listDispensingsAction() {
  const user = await requireAuthorizedUser("products.view");
  await requireDispenseCap(user.businessId);
  const rows = await dispensingRepository.list(user.businessId);
  return { success: true as const, rows };
}

export async function completeDispenseAction(input: unknown) {
  const user = await requireAuthorizedUser("products.update");
  await requireDispenseCap(user.businessId);

  const parsed = z
    .object({
      warehouseId: z.uuid(),
      patientName: z.string().trim().nullable().optional(),
      prescriptionRef: z.string().trim().nullable().optional(),
      notes: z.string().trim().nullable().optional(),
      items: z
        .array(
          z.object({
            productId: z.uuid(),
            batchId: z.uuid(),
            quantity: z.coerce.number().positive(),
            dosageInstructions: z.string().trim().nullable().optional(),
          }),
        )
        .min(1),
    })
    .safeParse(input);

  if (!parsed.success) {
    return {
      success: false as const,
      message: "Check warehouse, products, batches, and quantities.",
    };
  }

  try {
    const header = await dispensingService.createAndComplete({
      businessId: user.businessId,
      userId: user.id,
      ...parsed.data,
    });
    revalidatePath("/pharmacy/dispensing");
    revalidatePath("/inventory/stock");
    revalidatePath("/inventory/stock-movements");
    revalidatePath("/inventory/batches");
    return {
      success: true as const,
      message: "Medicines dispensed and stock updated.",
      id: header.id,
    };
  } catch (e) {
    return {
      success: false as const,
      message: e instanceof Error ? e.message : "Dispense failed.",
    };
  }
}
