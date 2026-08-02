"use server";

import { requireAuthorizedUser } from "@/lib/auth/authorize";

import { categoryService } from "../services";

export async function getCategories() {
  const user =
    await requireAuthorizedUser(
      "categories.view"
    );

  return categoryService.getCategories(
    user.businessId
  );
}

export async function getCategory(
  id: string
) {
  await requireAuthorizedUser(
    "categories.view"
  );

  return categoryService.getCategory(id);
}