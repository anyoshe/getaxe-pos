
import {
    pgTable,
    uuid,
    text,
    timestamp,
    boolean,
    index,
} from "drizzle-orm/pg-core";

import { businesses } from "../core/businesses";
import { users } from "../users/users";
import { journalStatusEnum } from "../shared";
import { journalSourceTypeEnum } from "../shared";

export const journalEntries = pgTable(
    "journal_entries",
    {
        id: uuid("id")
            .defaultRandom()
            .primaryKey(),

        businessId: uuid("business_id")
            .notNull()
            .references(() => businesses.id),

        journalNumber: text("journal_number")
            .notNull(),

        transactionDate: timestamp("transaction_date")
            .defaultNow()
            .notNull(),

        description: text("description")
            .notNull(),

        reference: text("reference"),
        externalReference: text("external_reference"),

        sourceType: journalSourceTypeEnum("source_type")
            .notNull(),

        sourceId: uuid("source_id")
            .notNull(),

        postedBy: uuid("posted_by")
            .references(() => users.id),

        status: journalStatusEnum("status")
            .default("POSTED")
            .notNull(),

        isSystemGenerated: boolean("is_system_generated")
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
        businessIdx: index("journal_entries_business_idx")
            .on(table.businessId),

        journalNumberIdx: index("journal_entries_number_idx")
            .on(table.journalNumber),

        transactionDateIdx: index("journal_entries_date_idx")
            .on(table.transactionDate),

        statusIdx: index("journal_entries_status_idx")
            .on(table.status),
    })
);
