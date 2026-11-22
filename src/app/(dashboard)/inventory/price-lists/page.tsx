import { requirePageAccess } from "@/lib/auth/authorize";

import {
  priceListService,
} from "@/features/inventory/services";

import {
  PriceListsClient,
} from "@/features/inventory/components/price-lists";

export default async function Page() {
  const user = await requirePageAccess("price_lists.view");

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