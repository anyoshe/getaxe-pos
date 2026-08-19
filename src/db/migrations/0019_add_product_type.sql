ALTER TABLE "products"
ADD COLUMN "product_type" text;

UPDATE "products"
SET "product_type" = 'physical'
WHERE "product_type" IS NULL;

ALTER TABLE "products"
ALTER COLUMN "product_type" SET NOT NULL;
