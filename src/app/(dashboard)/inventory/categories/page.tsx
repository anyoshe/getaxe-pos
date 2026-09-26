import { getCurrentUser } from "@/lib/auth/current-user";

import { categoryService } from "@/features/inventory/services";
import { ensureProductCostingSchema } from "@/features/inventory/services/ensure-product-costing-schema";

import { CategoriesClient } from "@/features/inventory/components/categories";

export default async function Page() {
  const user = await getCurrentUser();

  if (!user) {
    return null;
  }

  try {
    await ensureProductCostingSchema();
  } catch {
    // List may still work if columns already exist; save path will surface errors
  }

  const categories = await categoryService.getCategories(user.businessId);

  return <CategoriesClient categories={categories} />;
}
