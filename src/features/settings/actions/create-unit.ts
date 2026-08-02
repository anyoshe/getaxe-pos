"use server";

import { revalidatePath } from "next/cache";

import { requirePermission } from "@/lib/auth/permissions";

import { getCurrentUser } from "@/lib/auth/current-user";

import { createUnitSchema } from "../schemas/unit";
import { unitsService } from "../services/units.service";


export async function createUnitAction(
  formData: FormData
) {

  try {
        await requirePermission(
          "units.create"
        );
      } catch {
        return {
          success: false,
          message:
            "You do not have permission to create units.",
        };
      }
      
  const user = await getCurrentUser();

  if (!user) {
    return {
      success: false,
      message: "Unauthorized",
    };
  }


  const parsed =
    createUnitSchema.safeParse({
      businessId: user.businessId,

      code:
        formData.get("code"),

      name:
        formData.get("name"),

      symbol:
        formData.get("symbol") ||
        null,

      description:
        formData.get("description") ||
        null,

      active: true,
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

    await unitsService.createUnit(
      parsed.data
    );


    revalidatePath(
      "/settings/units"
    );


    return {
      success: true,
      message:
        "Unit created successfully.",
    };


  } catch (error) {

    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to create unit.",
    };
  }
}