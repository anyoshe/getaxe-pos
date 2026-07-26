"use server";

import { revalidatePath } from "next/cache";

import { getCurrentUser } from "@/lib/auth/current-user";

import { updateUnitSchema } from "../schemas/unit";
import { unitsService } from "../services/units.service";


export async function updateUnitAction(
  id: string,
  formData: FormData
) {

  const user = await getCurrentUser();


  if (!user) {
    return {
      success: false,
      message: "Unauthorized",
    };
  }


  const parsed =
    updateUnitSchema.safeParse({

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

    await unitsService.updateUnit(
      id,
      user.businessId,
      parsed.data
    );


    revalidatePath(
      "/settings/units"
    );


    return {
      success: true,
      message:
        "Unit updated successfully.",
    };


  } catch (error) {

    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to update unit.",
    };
  }
}