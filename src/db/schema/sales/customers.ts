import {
  pgTable,
  uuid,
  text,
  boolean,
  timestamp,
  numeric,
  date,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";

import { businesses } from "../core/businesses";
import {
  customerTypeEnum,
  genderEnum,
  bloodGroupEnum,
} from "../shared";

import { relations } from "drizzle-orm";
export const customers = pgTable(
  "customers",
  {
    id: uuid("id")
      .defaultRandom()
      .primaryKey(),

    businessId: uuid("business_id")
      .notNull()
      .references(() => businesses.id, {
        onDelete: "cascade",
      }),

    customerNumber: text("customer_number"),

    customerType: customerTypeEnum("customer_type")
      .default("INDIVIDUAL")
      .notNull(),

    companyName: text("company_name"),

    firstName: text("first_name")
      .notNull(),

    lastName: text("last_name"),

    phone: text("phone"),

    email: text("email"),

    idNumber: text("id_number"),

    taxPin: text("tax_pin"),

    address: text("address"),

    openingBalance: numeric("opening_balance", {
      precision: 12,
      scale: 2,
    })
      .default("0")
      .notNull(),

    creditLimit: numeric("credit_limit", {
      precision: 12,
      scale: 2,
    })
      .default("0")
      .notNull(),

    // Pharmacy / Clinical

    dateOfBirth: date("date_of_birth"),

    gender: genderEnum("gender"),

    bloodGroup: bloodGroupEnum("blood_group"),

    allergies: text("allergies"),

    emergencyContact: text("emergency_contact"),

    emergencyPhone: text("emergency_phone"),

    primaryPhysician: text("primary_physician"),

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
    businessIdx: index("customers_business_idx")
      .on(table.businessId),

    phoneIdx: index("customers_phone_idx")
      .on(table.phone),

    emailIdx: index("customers_email_idx")
      .on(table.email),

    idNumberIdx: index("customers_id_number_idx")
      .on(table.idNumber),

    activeIdx: index("customers_active_idx")
      .on(table.active),

    customerTypeIdx: index(
      "customers_type_idx"
    ).on(table.customerType),

    customerNumberUnique: uniqueIndex(
      "customers_business_customer_number_unique"
    ).on(
      table.businessId,
      table.customerNumber
    ),
  })
);

export const customersRelations = relations(
  customers,
  ({ one }) => ({
    business: one(businesses, {
      fields: [customers.businessId],
      references: [businesses.id],
    }),
  })
);