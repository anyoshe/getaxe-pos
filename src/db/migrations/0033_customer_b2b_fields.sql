-- B2B / business customer KYC (lending to another business)
ALTER TABLE "customers" ADD COLUMN IF NOT EXISTS "registration_number" text;
ALTER TABLE "customers" ADD COLUMN IF NOT EXISTS "trading_name" text;
ALTER TABLE "customers" ADD COLUMN IF NOT EXISTS "business_nature" text;
ALTER TABLE "customers" ADD COLUMN IF NOT EXISTS "contact_person_title" text;
