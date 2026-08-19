import type { InferSelectModel } from "drizzle-orm";

import { productPrices } from "@/db/schema/inventory/product_prices";
import { products } from "@/db/schema/inventory/products";
import { priceLists } from "@/db/schema/inventory/price_lists";

export type ProductPrice =
  InferSelectModel<typeof productPrices> & {
    product: InferSelectModel<typeof products>;

    priceList: InferSelectModel<typeof priceLists>;
  };