import {
    pgTable,
    uuid,
    text,
    boolean,
    timestamp,
    numeric,
    index,
    uniqueIndex,
} from "drizzle-orm/pg-core";

import { insuranceProviders } from "./insurance_providers";

export const insurancePlans = pgTable(
    "insurance_plans",
    {
        id: uuid("id")
            .defaultRandom()
            .primaryKey(),

        providerId: uuid("provider_id")
            .notNull()
            .references(() => insuranceProviders.id, {
                onDelete: "cascade",
            }),

        code: text("code")
            .notNull(),

        name: text("name")
            .notNull(),

        description: text("description"),

        annualLimit: numeric("annual_limit", {
            precision: 12,
            scale: 2,
        }),

        visitLimit: numeric("visit_limit", {
            precision: 12,
            scale: 2,
        }),

        effectiveFrom: timestamp("effective_from"),

        effectiveTo: timestamp("effective_to"),
        
        copayAmount: numeric("copay_amount", {
            precision: 12,
            scale: 2,
        })
            .default("0")
            .notNull(),

        requiresPreAuthorization: boolean("requires_pre_authorization")
            .default(false)
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
        providerIdx: index(
            "insurance_plans_provider_idx"
        ).on(table.providerId),

        activeIdx: index(
            "insurance_plans_active_idx"
        ).on(table.active),

        uniqueCode: uniqueIndex(
            "insurance_plans_provider_code_unique"
        ).on(
            table.providerId,
            table.code
        ),

        uniqueName: uniqueIndex(
            "insurance_plans_provider_name_unique"
        ).on(
            table.providerId,
            table.name
        ),
    })
);