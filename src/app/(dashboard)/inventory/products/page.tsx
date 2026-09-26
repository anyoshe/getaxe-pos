import { getCurrentUser } from "@/lib/auth/current-user";
import {
  productService,
  productContextService,
} from "@/features/inventory/services";
import { ProductsClient } from "@/features/inventory/components/products";

export default async function Page({
  searchParams,
}: {
  searchParams?:
    | Promise<{ q?: string; page?: string }>
    | { q?: string; page?: string };
}) {
  const user = await getCurrentUser();
  if (!user) return null;

  const sp = await Promise.resolve(searchParams ?? {});
  const q = typeof sp.q === "string" ? sp.q : "";
  const page = Math.max(1, Number(sp.page) || 1);
  const pageSize = 40;

  const [paged, context] = await Promise.all([
    productService.getProductsPage(user.businessId, {
      search: q,
      page,
      pageSize,
    }),
    productContextService.getContext(user.businessId),
  ]);

  return (
    <ProductsClient
      products={paged.items as any}
      context={context}
      pagination={{
        page: paged.page,
        pageSize: paged.pageSize,
        total: paged.total,
        totalPages: paged.totalPages,
        search: q,
      }}
    />
  );
}
