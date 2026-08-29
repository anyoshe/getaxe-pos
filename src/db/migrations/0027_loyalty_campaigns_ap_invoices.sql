-- Loyalty program (per business rules)
CREATE TABLE IF NOT EXISTS "loyalty_programs" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "business_id" uuid NOT NULL REFERENCES "businesses"("id") ON DELETE CASCADE,
  "name" text NOT NULL DEFAULT 'Default rewards',
  "points_per_amount" numeric(12, 4) NOT NULL DEFAULT 1,
  "amount_per_point_unit" numeric(12, 2) NOT NULL DEFAULT 100,
  "redemption_value_per_point" numeric(12, 4) NOT NULL DEFAULT 1,
  "min_redeem_points" integer NOT NULL DEFAULT 100,
  "active" boolean NOT NULL DEFAULT true,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS "loyalty_programs_business_unique"
  ON "loyalty_programs" ("business_id");

-- Points ledger
CREATE TABLE IF NOT EXISTS "loyalty_transactions" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "business_id" uuid NOT NULL REFERENCES "businesses"("id") ON DELETE CASCADE,
  "customer_id" uuid NOT NULL REFERENCES "customers"("id") ON DELETE CASCADE,
  "type" text NOT NULL,
  "points" integer NOT NULL,
  "balance_after" integer NOT NULL DEFAULT 0,
  "reference" text,
  "sale_id" uuid,
  "notes" text,
  "created_by" uuid REFERENCES "users"("id"),
  "created_at" timestamp DEFAULT now() NOT NULL
);
CREATE INDEX IF NOT EXISTS "loyalty_transactions_customer_idx"
  ON "loyalty_transactions" ("customer_id");
CREATE INDEX IF NOT EXISTS "loyalty_transactions_business_idx"
  ON "loyalty_transactions" ("business_id");

-- Supplier AP invoices (true AP, not only PO aging)
CREATE TABLE IF NOT EXISTS "supplier_invoices" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "business_id" uuid NOT NULL REFERENCES "businesses"("id") ON DELETE CASCADE,
  "supplier_id" uuid NOT NULL REFERENCES "suppliers"("id"),
  "purchase_order_id" uuid REFERENCES "purchase_orders"("id"),
  "invoice_number" text NOT NULL,
  "invoice_date" timestamp DEFAULT now() NOT NULL,
  "due_date" timestamp,
  "status" text NOT NULL DEFAULT 'OPEN',
  "subtotal" numeric(14, 2) NOT NULL DEFAULT 0,
  "tax" numeric(14, 2) NOT NULL DEFAULT 0,
  "total" numeric(14, 2) NOT NULL DEFAULT 0,
  "amount_paid" numeric(14, 2) NOT NULL DEFAULT 0,
  "balance_due" numeric(14, 2) NOT NULL DEFAULT 0,
  "currency" text NOT NULL DEFAULT 'KES',
  "notes" text,
  "created_by" uuid REFERENCES "users"("id"),
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);
CREATE INDEX IF NOT EXISTS "supplier_invoices_business_idx" ON "supplier_invoices" ("business_id");
CREATE INDEX IF NOT EXISTS "supplier_invoices_supplier_idx" ON "supplier_invoices" ("supplier_id");
CREATE UNIQUE INDEX IF NOT EXISTS "supplier_invoices_business_number_unique"
  ON "supplier_invoices" ("business_id", "invoice_number");
