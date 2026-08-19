import type { InferSelectModel } from "drizzle-orm";

import { priceLists } from "@/db/schema/inventory/price_lists";

export type PriceList =
  InferSelectModel<typeof priceLists>;
