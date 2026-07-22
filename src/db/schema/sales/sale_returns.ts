import {
    pgTable,
    uuid,
    text,
    timestamp,
    numeric,
    index,
    uniqueIndex,
} from "drizzle-orm/pg-core";

import { businesses } from "../core/businesses";
import { customers } from "./customers";
import { sales } from "./sales";
import { users } from "../users/users";
import { saleReturnReasonEnum } from "../shared";

export const saleReturns = pgTable(
    "sale_returns",
    {
        id: uuid("id")
            .defaultRandom()
            .primaryKey(),

        businessId: uuid("business_id")
            .notNull()
            .references(() => businesses.id, {
                onDelete: "cascade",
            }),

        saleId: uuid("sale_id")
            .notNull()
            .references(() => sales.id, {
                onDelete: "restrict",
            }),

        customerId: uuid("customer_id")
            .references(() => customers.id, {
                onDelete: "set null",
            }),

        returnNumber: text("return_number")
            .notNull(),

        reason: saleReturnReasonEnum("reason")
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
            .notNull()
            .references(() => users.id),

        approvedBy: uuid("approved_by")
            .references(() => users.id),

        createdAt: timestamp("created_at")
            .defaultNow()
            .notNull(),

        updatedAt: timestamp("updated_at")
            .defaultNow()
            .notNull(),
    },
    (table) => ({
        businessIdx: index(
            "sale_returns_business_idx"
        ).on(table.businessId),

        saleIdx: index(
            "sale_returns_sale_idx"
        ).on(table.saleId),

        customerIdx: index(
            "sale_returns_customer_idx"
        ).on(table.customerId),

        reasonIdx: index(
            "sale_returns_reason_idx"
        ).on(table.reason),

        createdAtIdx: index(
            "sale_returns_created_at_idx"
        ).on(table.createdAt),

        returnNumberUnique: uniqueIndex(
            "sale_returns_business_return_unique"
        ).on(
            table.businessId,
            table.returnNumber
        ),
    })
);