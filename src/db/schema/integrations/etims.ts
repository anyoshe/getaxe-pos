import {
  pgTable,
  uuid,
  text,
  boolean,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { businesses } from "../core/businesses";

/**
 * Phase A: store enablement + tenant KRA identifiers.
 * Live OSCU/VSCU calls land in a later phase; simulationMode is environment === "simulation".
 */
export const etimsSettings = pgTable(
  "etims_settings",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    businessId: uuid("business_id")
      .notNull()
      .references(() => businesses.id, { onDelete: "cascade" }),
    enabled: boolean("enabled").default(false).notNull(),
    /** simulation | sandbox | production */
    environment: text("environment").default("simulation").notNull(),
    kraPin: text("kra_pin"),
    branchId: text("branch_id"),
    deviceSerial: text("device_serial"),
    notes: text("notes"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (t) => ({
    businessUidx: uniqueIndex("etims_settings_business_uidx").on(t.businessId),
  }),
);
