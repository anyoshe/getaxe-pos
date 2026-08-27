import {
  getCurrentUser,
} from "@/lib/auth/current-user";

import {
  productService,
  priceListService,
  productPriceService,
} from "@/features/inventory/services";
import { unitsService } from "@/features/settings/services/units.service";

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
    units,
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

    unitsService.getUnits(user.businessId),
  ]);

  return (
    <ProductPricesClient
      units={units.map((u) => ({ id: u.id, name: u.name }))}
      products={products as any}
      priceLists={priceLists}
      productPrices={productPrices}
    />
  );
}