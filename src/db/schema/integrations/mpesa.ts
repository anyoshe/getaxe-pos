import {
  pgTable,
  uuid,
  text,
  boolean,
  timestamp,
  numeric,
  uniqueIndex,
  index,
} from "drizzle-orm/pg-core";
import { businesses } from "../core/businesses";
import { users } from "../users/users";

export const mpesaSettings = pgTable(
  "mpesa_settings",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    businessId: uuid("business_id")
      .notNull()
      .references(() => businesses.id, { onDelete: "cascade" }),
    enabled: boolean("enabled").default(false).notNull(),
    environment: text("environment").default("sandbox").notNull(),
    consumerKey: text("consumer_key"),
    consumerSecret: text("consumer_secret"),
    passkey: text("passkey"),
    shortcode: text("shortcode"),
    shortcodeType: text("shortcode_type").default("TILL").notNull(),
    accountReference: text("account_reference").default("GetAxe"),
    transactionDesc: text("transaction_desc").default("POS Sale"),
    simulationMode: boolean("simulation_mode").default(true).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (t) => ({
    businessUidx: uniqueIndex("mpesa_settings_business_uidx").on(t.businessId),
  }),
);

export const mpesaStkRequests = pgTable(
  "mpesa_stk_requests",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    businessId: uuid("business_id")
      .notNull()
      .references(() => businesses.id, { onDelete: "cascade" }),
    checkoutRequestId: text("checkout_request_id"),
    merchantRequestId: text("merchant_request_id"),
    phone: text("phone").notNull(),
    amount: numeric("amount", { precision: 18, scale: 2 }).notNull(),
    status: text("status").default("PENDING").notNull(),
    mpesaReceipt: text("mpesa_receipt"),
    resultCode: text("result_code"),
    resultDesc: text("result_desc"),
    cashAccountId: uuid("cash_account_id"),
    createdBy: uuid("created_by").references(() => users.id),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (t) => ({
    checkoutIdx: index("mpesa_stk_checkout_idx").on(t.checkoutRequestId),
    businessIdx: index("mpesa_stk_business_idx").on(t.businessId, t.createdAt),
  }),
);
