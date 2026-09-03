ALTER TABLE "customers" ADD COLUMN IF NOT EXISTS "occupation" text;
ALTER TABLE "customers" ADD COLUMN IF NOT EXISTS "employer" text;
ALTER TABLE "customers" ADD COLUMN IF NOT EXISTS "id_type" text;
ALTER TABLE "customers" ADD COLUMN IF NOT EXISTS "county" text;
ALTER TABLE "customers" ADD COLUMN IF NOT EXISTS "city" text;
ALTER TABLE "customers" ADD COLUMN IF NOT EXISTS "postal_code" text;
ALTER TABLE "customers" ADD COLUMN IF NOT EXISTS "credit_terms_days" integer DEFAULT 30;
ALTER TABLE "customers" ADD COLUMN IF NOT EXISTS "allow_credit" boolean DEFAULT false NOT NULL;
ALTER TABLE "customers" ADD COLUMN IF NOT EXISTS "credit_notes" text;
