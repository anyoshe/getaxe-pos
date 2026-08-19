import {
  getCurrentUser,
} from "@/lib/auth/current-user";

import {
  priceListService,
} from "@/features/inventory/services";

import {
  PriceListsClient,
} from "@/features/inventory/components/price-lists";

export default async function Page() {
  const user =
    await getCurrentUser();

  if (!user) {
    return null;
  }

  const priceLists =
    await priceListService.getPriceLists(
      user.businessId
    );

  return (
    <PriceListsClient
      priceLists={priceLists}
    />
  );
}