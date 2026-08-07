"use server";

import { requireAuthorizedUser } from "@/lib/auth/authorize";

import { supplierService } from "../services";

export async function getSuppliers() {
  const user = await requireAuthorizedUser("suppliers.view");

  return supplierService.getSuppliers(user.businessId);
}

export async function getSupplier(id: string) {
  const user = await requireAuthorizedUser("suppliers.view");

  return supplierService.getSupplier(id, user.businessId);
}
