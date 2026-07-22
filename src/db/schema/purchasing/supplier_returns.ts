import {
    pgTable,
    uuid,
    text,
    timestamp,
    numeric,
    index,
} from "drizzle-orm/pg-core";

import { businesses } from "../core/businesses";
import { suppliers } from "../inventory/suppliers";
import { users } from "../users/users";
import { returnReasonEnum } from "../shared";

export const supplierReturns = pgTable(
    "supplier_returns",
    {
        id: uuid("id")
            .defaultRandom()
            .primaryKey(),

        businessId: uuid("business_id")
            .notNull()
            .references(() => businesses.id),

        supplierId: uuid("supplier_id")
            .notNull()
            .references(() => suppliers.id),

        returnNumber: text("return_number")
            .notNull(),

        reason: returnReasonEnum("reason")
            .default("OTHER")
            .notNull(),

        subtotal: numeric("subtotal", {
            precision: 12,
            scale: 2,
        }).default("0"),

        tax: numeric("tax", {
            precision: 12,
            scale: 2,
        }).default("0"),

        total: numeric("total", {
            precision: 12,
            scale: 2,
        }).default("0"),

        createdBy: uuid("created_by")
            .references(() => users.id),

        createdAt: timestamp("created_at")
            .defaultNow()
            .notNull(),

        updatedAt: timestamp("updated_at")
            .defaultNow()
            .notNull(),
    },
    (table) => ({
        businessIdx: index("supplier_return_business_idx").on(table.businessId),

        supplierIdx: index("supplier_return_supplier_idx").on(table.supplierId),

        numberIdx: index("supplier_return_number_idx").on(table.returnNumber),
    })
);