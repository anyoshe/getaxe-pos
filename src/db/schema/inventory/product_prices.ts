
import {
  pgTable,
  uuid,
  numeric,
  boolean,
  timestamp,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";

import { businesses } from "../core/businesses";
import { products } from "./products";
import { priceLists } from "./price_lists";
import { units } from "../settings/units";
import { relations } from "drizzle-orm";

export const productPrices = pgTable(
  "product_prices",
  {
    id: uuid("id")
      .defaultRandom()
      .primaryKey(),

    businessId: uuid("business_id")
      .notNull()
      .references(() => businesses.id),

    productId: uuid("product_id")
      .notNull()
      .references(() => products.id, {
        onDelete: "cascade",
      }),

    priceListId: uuid("price_list_id")
      .notNull()
      .references(() => priceLists.id),

    /** Sales unit this price applies to; null = legacy default sales unit. */
    unitId: uuid("unit_id").references(() => units.id),

    price: numeric("price", {
      precision: 12,
      scale: 2,
    })
      .notNull(),

    minimumQuantity: numeric("minimum_quantity", {
      precision: 12,
      scale: 2,
    })
      .default("1")
      .notNull(),

    active: boolean("active")
      .default(true)
      .notNull(),

    createdAt: timestamp("created_at")
      .defaultNow()
      .notNull(),

    updatedAt: timestamp("updated_at")
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    businessIdx: index("product_prices_business_idx")
      .on(table.businessId),

    productIdx: index("product_prices_product_idx")
      .on(table.productId),

    priceListIdx: index("product_prices_price_list_idx")
      .on(table.priceListId),

    uniquePrice: uniqueIndex(
      "product_prices_product_price_list_qty_unique"
    ).on(
      table.productId,
      table.priceListId,
      table.minimumQuantity
    ),
  })
);
export const productPricesRelations = relations(
  productPrices,
  ({ one }) => ({
    business: one(businesses, {
      fields: [productPrices.businessId],
      references: [businesses.id],
    }),

    product: one(products, {
      fields: [productPrices.productId],
      references: [products.id],
    }),

    priceList: one(priceLists, {
      fields: [productPrices.priceListId],
      references: [priceLists.id],
    }),
  })
);
