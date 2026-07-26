"use server";

import { revalidatePath } from "next/cache";

import { getCurrentUser } from "@/lib/auth/current-user";

import { unitsService } from "../services/units.service";


export async function deleteUnitAction(
  id: string
) {

  const user = await getCurrentUser();


  if (!user) {
    return {
      success: false,
      message: "Unauthorized",
    };
  }


  try {

    await unitsService.deleteUnit(
      id,
      user.businessId
    );


    revalidatePath(
      "/settings/units"
    );


    return {
      success: true,
      message:
        "Unit deleted successfully.",
    };


  } catch (error) {

    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to delete unit.",
    };
  }
}