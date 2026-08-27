import {
  getCurrentUser,
} from "@/lib/auth/current-user";


import {
  productService,
  productContextService,
} from "@/features/inventory/services";


import {
  ProductsClient,
} from "@/features/inventory/components/products";


export default async function Page() {

  const user =
    await getCurrentUser();


  if (!user) {
    return null;
  }


  const [
    products,
    context,

  ] = await Promise.all([

    productService.getProducts(
      user.businessId
    ),

    productContextService.getContext(
      user.businessId
    ),

  ]);


  return (
    <ProductsClient
      products={products as any}
      context={context}
    />
  );

}