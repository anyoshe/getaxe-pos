import {
  getCurrentUser,
} from "@/lib/auth/current-user";

import {
  productService,
  priceListService,
  productPriceService,
} from "@/features/inventory/services";

import {
  ProductPricesClient,
} from "@/features/inventory/components/product-prices";

export default async function Page() {
  const user =
    await getCurrentUser();

  if (!user) {
    return null;
  }

  const [
    products,
    priceLists,
    productPrices,
  ] = await Promise.all([
    productService.getProducts(
      user.businessId
    ),

    priceListService.getPriceLists(
      user.businessId
    ),

    productPriceService.getProductPrices(
      user.businessId
    ),
  ]);

  return (
    <ProductPricesClient
      products={products}
      priceLists={priceLists}
      productPrices={productPrices}
    />
  );
}