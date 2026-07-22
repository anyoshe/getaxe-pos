import {
    pgTable,
    uuid,
    timestamp,
    numeric,
    text,
    index,
} from "drizzle-orm/pg-core";

import { businesses } from "../core/businesses";
import { sales } from "./sales";
import {
    paymentMethodEnum,
    paymentStatusEnum,
} from "../shared";
import { users } from "../users/users";
import { cashAccounts } from "../finance/cash_accounts";

export const payments = pgTable(
    "payments",
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
                onDelete: "cascade",
            }),

        cashAccountId: uuid("cash_account_id")
            .references(() => cashAccounts.id),

        method: paymentMethodEnum("method")
            .notNull(),

        status: paymentStatusEnum("status")
            .default("COMPLETED")
            .notNull(),

        amount: numeric("amount", {
            precision: 12,
            scale: 2,
        }).notNull(),

        transactionReference: text("reference"),

        paidAt: timestamp("paid_at")
            .defaultNow()
            .notNull(),

        createdAt: timestamp("created_at")
            .defaultNow()
            .notNull(),

        receivedBy: uuid("received_by")
            .notNull()
            .references(() => users.id),
    },
    (table) => ({
        businessIdx: index(
            "payments_business_idx"
        ).on(table.businessId),

        saleIdx: index(
            "payments_sale_idx"
        ).on(table.saleId),

        methodIdx: index(
            "payments_method_idx"
        ).on(table.method),

        statusIdx: index(
            "payments_status_idx"
        ).on(table.status),

        referenceIdx: index(
            "payments_reference_idx"
        ).on(table.transactionReference),

        receivedByIdx: index(
            "payments_received_by_idx"
        ).on(table.receivedBy),

        paidAtIdx: index(
            "payments_paid_at_idx"
        ).on(table.paidAt),
    })
);