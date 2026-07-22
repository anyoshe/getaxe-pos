
import {
    pgTable,
    uuid,
    text,
    integer,
    numeric,
    boolean,
    timestamp,
    index,
} from "drizzle-orm/pg-core";

import { prescriptions } from "./prescriptions";
import { products } from "../inventory/products";

export const prescriptionItems = pgTable(
    "prescription_items",
    {
        id: uuid("id")
            .defaultRandom()
            .primaryKey(),

        prescriptionId: uuid("prescription_id")
            .notNull()
            .references(() => prescriptions.id, {
                onDelete: "cascade",
            }),

        productId: uuid("product_id")
            .notNull()
            .references(() => products.id),

        lineNumber: integer("line_number")
            .notNull(),

        dosage: text("dosage"),

        frequency: text("frequency"),

        duration: text("duration"),

        route: text("route"),

        quantityPrescribed: numeric("quantity_prescribed", {
            precision: 12,
            scale: 2,
        })
            .notNull(),

        quantityDispensed: numeric("quantity_dispensed", {
            precision: 12,
            scale: 2,
        })
            .default("0")
            .notNull(),

        substitutionAllowed: boolean("substitution_allowed")
            .default(false)
            .notNull(),

        dispenseAsWritten: boolean("dispense_as_written")
            .default(false)
            .notNull(),

        instructions: text("instructions"),

        createdAt: timestamp("created_at")
            .defaultNow()
            .notNull(),

        updatedAt: timestamp("updated_at")
            .defaultNow()
            .notNull(),
    },
    (table) => ({
        prescriptionIdx: index(
            "prescription_items_prescription_idx"
        ).on(table.prescriptionId),

        productIdx: index(
            "prescription_items_product_idx"
        ).on(table.productId),
    })
);

