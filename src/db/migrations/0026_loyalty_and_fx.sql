-- Loyalty points on customers (CRM rewards)
ALTER TABLE "customers"
  ADD COLUMN IF NOT EXISTS "loyalty_points" integer DEFAULT 0 NOT NULL;

-- Exchange rates for multi-currency display / conversion
CREATE TABLE IF NOT EXISTS "exchange_rates" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "business_id" uuid NOT NULL REFERENCES "businesses"("id") ON DELETE CASCADE,
  "from_currency" text NOT NULL,
  "to_currency" text NOT NULL,
  "rate" numeric(18, 8) NOT NULL,
  "effective_date" date DEFAULT CURRENT_DATE NOT NULL,
  "active" boolean DEFAULT true NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "exchange_rates_business_idx" ON "exchange_rates" ("business_id");
CREATE UNIQUE INDEX IF NOT EXISTS "exchange_rates_business_pair_date_unique"
  ON "exchange_rates" ("business_id", "from_currency", "to_currency", "effective_date");
