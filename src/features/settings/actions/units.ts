"use server";

import { revalidatePath } from "next/cache";

import { unitsService } from "../services/units.service";

import {
  createUnitSchema,
  updateUnitSchema,
} from "../schemas/unit";


export async function getUnits(
  businessId: string
) {
  return unitsService.getUnits(
    businessId
  );
}


export async function getUnit(
  id: string,
  businessId: string
) {
  return unitsService.getUnit(
    id,
    businessId
  );
}


export async function createUnit(
  input: unknown
) {
  const data =
    createUnitSchema.parse(input);


  const unit =
    await unitsService.createUnit(
      data
    );


  revalidatePath(
    "/settings/units"
  );


  return unit;
}


export async function updateUnit(
  id: string,
  businessId: string,
  input: unknown
) {
  const data =
    updateUnitSchema.parse(input);


  const unit =
    await unitsService.updateUnit(
      id,
      businessId,
      data
    );


  revalidatePath(
    "/settings/units"
  );


  return unit;
}


export async function deleteUnit(
  id: string,
  businessId: string
) {
  const unit =
    await unitsService.deleteUnit(
      id,
      businessId
    );


  revalidatePath(
    "/settings/units"
  );


  return unit;
}