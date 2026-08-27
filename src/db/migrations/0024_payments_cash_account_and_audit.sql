-- Align payments.cash_account_id with Drizzle schema (POS payment ledger)
ALTER TABLE "payments"
  ADD COLUMN IF NOT EXISTS "cash_account_id" uuid;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'payments_cash_account_id_cash_accounts_id_fk'
  ) THEN
    ALTER TABLE "payments"
      ADD CONSTRAINT "payments_cash_account_id_cash_accounts_id_fk"
      FOREIGN KEY ("cash_account_id") REFERENCES "public"."cash_accounts"("id")
      ON DELETE SET NULL ON UPDATE NO ACTION;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS "payments_cash_account_idx" ON "payments" ("cash_account_id");

-- activity_logs already exists from baseline; ensure useful indexes (idempotent)
CREATE INDEX IF NOT EXISTS "activity_logs_business_idx" ON "activity_logs" ("business_id");
CREATE INDEX IF NOT EXISTS "activity_logs_user_idx" ON "activity_logs" ("user_id");
CREATE INDEX IF NOT EXISTS "activity_logs_entity_idx" ON "activity_logs" ("entity");
CREATE INDEX IF NOT EXISTS "activity_logs_created_idx" ON "activity_logs" ("created_at");
