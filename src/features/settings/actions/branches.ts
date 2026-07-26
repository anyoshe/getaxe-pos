"use server";

import { revalidatePath } from "next/cache";

import { branchesService } from "../services/branches.service";

import {
  createBranchSchema,
  updateBranchSchema,
} from "../schemas/branch";

export async function getBranches(
  businessId: string
) {
  return branchesService.getBranches(businessId);
}

export async function getBranch(
  id: string,
  businessId: string
) {
  return branchesService.getBranch(
    id,
    businessId
  );
}


export async function createBranch(
  input: unknown
) {
  const data =
    createBranchSchema.parse(input);

  const branch =
    await branchesService.createBranch(data);

  revalidatePath("/settings/branches");

  return branch;
}

export async function updateBranch(
  id: string,
  businessId: string,
  input: unknown
) {
  const data =
    updateBranchSchema.parse(input);

  const branch =
    await branchesService.updateBranch(
      id,
      businessId,
      data
    );

  revalidatePath("/settings/branches");

  return branch;
}

export async function deleteBranch(
  id: string,
  businessId: string
) {
  const branch =
    await branchesService.deleteBranch(
      id,
      businessId
    );

  revalidatePath("/settings/branches");

  return branch;
}

export async function getBranchOptions(
  businessId: string
) {
  return branchesService.getBranches(
    businessId
  );
}