import {
  getCurrentUser,
} from "@/lib/auth/current-user";

import {
  categoryService,
} from "@/features/inventory/services";

import {
  CategoriesClient,
} from "@/features/inventory/components/categories";

export default async function Page() {
  const user =
    await getCurrentUser();

  if (!user) {
    return null;
  }

  const categories =
    await categoryService.getCategories(
      user.businessId
    );

  return (
    <CategoriesClient
      categories={categories}
    />
  );
}