import {
    pgTable,
    uuid,
    text,
    numeric,
    boolean,
    integer,
    timestamp,
    index,
} from "drizzle-orm/pg-core";

import { insuranceClaims } from "./insurance_claims";
import { products } from "../inventory/products";

export const insuranceClaimItems = pgTable(
    "insurance_claim_items",
    {
        id: uuid("id")
            .defaultRandom()
            .primaryKey(),

        claimId: uuid("claim_id")
            .notNull()
            .references(() => insuranceClaims.id, {
                onDelete: "cascade",
            }),

        lineNumber: integer("line_number")
            .notNull(),

        productId: uuid("product_id")
            .references(() => products.id),

        description: text("description")
            .notNull(),

        quantity: numeric("quantity", {
            precision: 12,
            scale: 2,
        })
            .default("1")
            .notNull(),

        unitPrice: numeric("unit_price", {
            precision: 12,
            scale: 2,
        })
            .notNull(),


        covered: boolean("covered")
            .default(true)
            .notNull(),


        claimedAmount: numeric("claimed_amount", {
            precision: 12,
            scale: 2,
        })
            .notNull(),

        approvedAmount: numeric("approved_amount", {
            precision: 12,
            scale: 2,
        })
            .default("0")
            .notNull(),

        rejectedAmount: numeric("rejected_amount", {
            precision: 12,
            scale: 2,
        })
            .default("0")
            .notNull(),

        rejectionReason: text("rejection_reason"),


        createdAt: timestamp("created_at")
            .defaultNow()
            .notNull(),
    },
    (table) => ({
        claimIdx: index(
            "insurance_claim_items_claim_idx"
        ).on(table.claimId),

        productIdx: index(
            "insurance_claim_items_product_idx"
        ).on(table.productId),
    })
);