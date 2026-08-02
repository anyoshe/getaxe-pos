import {
    pgTable,
    uuid,
    timestamp,
    text,
    index,
} from "drizzle-orm/pg-core";

import {
    relations,
} from "drizzle-orm";

import {
    businesses,
} from "../core/businesses";

import {
    payments,
} from "./payments";

import {
    users,
} from "../users/users";

export const paymentReversals =
    pgTable(
        "payment_reversals",
        {

            id:
                uuid("id")
                    .defaultRandom()
                    .primaryKey(),

            businessId:
                uuid("business_id")
                    .notNull()
                    .references(
                        () => businesses.id,
                        {
                            onDelete:
                                "cascade",
                        }
                    ),

            paymentId:
                uuid("payment_id")
                    .notNull()
                    .references(
                        () => payments.id,
                        {
                            onDelete:
                                "restrict",
                        }
                    ),

            reversedBy:
                uuid("reversed_by")
                    .notNull()
                    .references(
                        () => users.id
                    ),

            reason:
                text("reason")
                    .notNull(),

            reversedAt:
                timestamp("reversed_at")
                    .defaultNow()
                    .notNull(),

            createdAt:
                timestamp("created_at")
                    .defaultNow()
                    .notNull(),

        },
        (table) => ({

            paymentIdx:
                index(
                    "payment_reversals_payment_idx"
                ).on(
                    table.paymentId
                ),

            businessIdx:
                index(
                    "payment_reversals_business_idx"
                ).on(
                    table.businessId
                ),

        })
    );

export const paymentReversalsRelations =
    relations(
        paymentReversals,
        ({ one }) => ({

            business:
                one(
                    businesses,
                    {
                        fields: [
                            paymentReversals.businessId,
                        ],
                        references: [
                            businesses.id,
                        ],
                    }
                ),

            payment:
                one(
                    payments,
                    {
                        fields: [
                            paymentReversals.paymentId,
                        ],
                        references: [
                            payments.id,
                        ],
                    }
                ),

            reversedByUser:
                one(
                    users,
                    {
                        fields: [
                            paymentReversals.reversedBy,
                        ],
                        references: [
                            users.id,
                        ],
                    }
                ),

        })
    );