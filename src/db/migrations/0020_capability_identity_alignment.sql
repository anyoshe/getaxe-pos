-- Align business_capabilities.capability_id with catalogue string IDs
-- (e.g. core.attachments), not capabilities.id (uuid).
--
-- Order matters: drop the old UUID FK BEFORE changing the column type.

ALTER TABLE "business_capabilities"
  DROP CONSTRAINT IF EXISTS "business_capabilities_capability_id_capabilities_id_fk";

ALTER TABLE "business_capabilities"
  DROP CONSTRAINT IF EXISTS "business_capabilities_capability_id_capabilities_capability_id_fk";

-- Convert uuid values to text (legacy rows become uuid-as-text)
ALTER TABLE "business_capabilities"
  ALTER COLUMN "capability_id" TYPE text USING "capability_id"::text;

-- Drop legacy rows that still store UUID text (no matching catalogue id).
-- Businesses will be re-provisioned / capabilities re-enabled as needed.
DELETE FROM "business_capabilities" bc
WHERE NOT EXISTS (
  SELECT 1
  FROM "capabilities" c
  WHERE c."capability_id" = bc."capability_id"
);

-- Deduplicate
DELETE FROM "business_capabilities" a
USING "business_capabilities" b
WHERE a.id < b.id
  AND a.business_id = b.business_id
  AND a.capability_id = b.capability_id;

-- Point FK at capabilities.capability_id (text catalogue id)
ALTER TABLE "business_capabilities"
  ADD CONSTRAINT "business_capabilities_capability_id_capabilities_capability_id_fk"
  FOREIGN KEY ("capability_id") REFERENCES "public"."capabilities"("capability_id")
  ON DELETE cascade ON UPDATE no action;

CREATE UNIQUE INDEX IF NOT EXISTS "business_capabilities_business_capability_unique"
  ON "business_capabilities" USING btree ("business_id", "capability_id");
