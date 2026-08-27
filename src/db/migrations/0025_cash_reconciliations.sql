CREATE TABLE IF NOT EXISTS "cash_reconciliations" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "business_id" uuid NOT NULL REFERENCES "businesses"("id"),
  "cash_account_id" uuid NOT NULL REFERENCES "cash_accounts"("id"),
  "reconciliation_date" date NOT NULL,
  "opening_balance" numeric(18, 2) DEFAULT '0' NOT NULL,
  "system_inflows" numeric(18, 2) DEFAULT '0' NOT NULL,
  "system_outflows" numeric(18, 2) DEFAULT '0' NOT NULL,
  "expected_balance" numeric(18, 2) DEFAULT '0' NOT NULL,
  "counted_balance" numeric(18, 2) NOT NULL,
  "difference" numeric(18, 2) DEFAULT '0' NOT NULL,
  "notes" text,
  "status" text DEFAULT 'COMPLETED' NOT NULL,
  "reconciled_by" uuid REFERENCES "users"("id"),
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "cash_recon_business_idx" ON "cash_reconciliations" ("business_id");
CREATE INDEX IF NOT EXISTS "cash_recon_account_idx" ON "cash_reconciliations" ("cash_account_id");
CREATE INDEX IF NOT EXISTS "cash_recon_date_idx" ON "cash_reconciliations" ("reconciliation_date");
CREATE UNIQUE INDEX IF NOT EXISTS "cash_recon_account_date_unique"
  ON "cash_reconciliations" ("business_id", "cash_account_id", "reconciliation_date");
