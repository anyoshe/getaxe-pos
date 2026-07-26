import {
    pgTable,
    uuid,
    text,
    timestamp,
    index,
    uniqueIndex,
} from "drizzle-orm/pg-core";

import { businesses } from "../core/businesses";
import { prescriptions } from "./prescriptions";
import { users } from "../users/users";
import { sales } from "../sales/sales";
import { dispensationStatusEnum } from "../shared";
import { branches } from "../settings/branches";
import { warehouses } from "../settings/warehouses";

import { relations } from "drizzle-orm";

import { dispensationItems } from "./dispensation_items";

export const dispensations = pgTable(
    "dispensations",
    {
        id: uuid("id")
            .defaultRandom()
            .primaryKey(),

        businessId: uuid("business_id")
            .notNull()
            .references(() => businesses.id),

        branchId: uuid("branch_id")
            .notNull()
            .references(() => branches.id),

        warehouseId: uuid("warehouse_id")
            .notNull()
            .references(() => warehouses.id),

        prescriptionId: uuid("prescription_id")
            .notNull()
            .references(() => prescriptions.id),

        saleId: uuid("sale_id")
            .references(() => sales.id),

        dispensationNumber: text("dispensation_number")
            .notNull(),

        dispensedBy: uuid("dispensed_by")
            .references(() => users.id),

        checkedBy: uuid("checked_by")
            .references(() => users.id),

        status: dispensationStatusEnum("status")
            .default("PENDING")
            .notNull(),

        notes: text("notes"),

        dispensedAt: timestamp("dispensed_at"),

        createdAt: timestamp("created_at")
            .defaultNow()
            .notNull(),

        updatedAt: timestamp("updated_at")
            .defaultNow()
            .notNull(),
    },
    (table) => ({
        businessIdx: index("dispensations_business_idx")
            .on(table.businessId),

        branchIdx: index("dispensations_branch_idx")
            .on(table.branchId),

        warehouseIdx: index("dispensations_warehouse_idx")
            .on(table.warehouseId),

        prescriptionIdx: index("dispensations_prescription_idx")
            .on(table.prescriptionId),

        saleIdx: index("dispensations_sale_idx")
            .on(table.saleId),

        statusIdx: index("dispensations_status_idx")
            .on(table.status),

        numberIdx: uniqueIndex(
            "dispensations_business_number_unique"
        ).on(
            table.businessId,
            table.dispensationNumber
        ),
    })
);
export const dispensationsRelations = relations(
  dispensations,
  ({ one, many }) => ({
    business: one(businesses, {
      fields: [dispensations.businessId],
      references: [businesses.id],
    }),

    branch: one(branches, {
      fields: [dispensations.branchId],
      references: [branches.id],
    }),

    warehouse: one(warehouses, {
      fields: [dispensations.warehouseId],
      references: [warehouses.id],
    }),

    prescription: one(prescriptions, {
      fields: [dispensations.prescriptionId],
      references: [prescriptions.id],
    }),

    sale: one(sales, {
      fields: [dispensations.saleId],
      references: [sales.id],
    }),

    dispensedByUser: one(users, {
      fields: [dispensations.dispensedBy],
      references: [users.id],
    }),

    checkedByUser: one(users, {
      fields: [dispensations.checkedBy],
      references: [users.id],
    }),

    items: many(dispensationItems),
  })
);