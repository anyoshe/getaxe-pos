import {
    pgTable,
    uuid,
    text,
    numeric,
    integer,
    index,
    uniqueIndex,
    check,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

import { journalEntries } from "./journal_entries";
import { chartOfAccounts } from "./chart_of_accounts";

export const journalEntryLines = pgTable(
    "journal_entry_lines",
    {
        id: uuid("id")
            .defaultRandom()
            .primaryKey(),


        journalEntryId: uuid("journal_entry_id")
            .notNull()
            .references(() => journalEntries.id, {
                onDelete: "cascade",
            }),
        lineNumber: integer("line_number")
            .notNull(),
        accountId: uuid("account_id")
            .notNull()
            .references(() => chartOfAccounts.id),

        description: text("description"),

        debit: numeric("debit", {
            precision: 18,
            scale: 2,
        })
            .default("0")
            .notNull(),

        credit: numeric("credit", {
            precision: 18,
            scale: 2,
        })
            .default("0")
            .notNull(),
    },
    (table) => ({
        journalLineUnique: uniqueIndex(
            "journal_entry_lines_journal_line_unique"
        ).on(
            table.journalEntryId,
            table.lineNumber
        ),
        journalIdx: index("journal_entry_lines_journal_idx")
            .on(table.journalEntryId),

        accountIdx: index("journal_entry_lines_account_idx")
            .on(table.accountId),

        debitOrCreditCheck: check(
            "journal_entry_lines_debit_credit_check",
            sql`NOT (
        ${table.debit} > 0
        AND
        ${table.credit} > 0
      )`
        ),
    })
);
