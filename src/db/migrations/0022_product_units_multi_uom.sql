-- Multi-unit inventory: product_units, movement snapshots, price-by-unit, unit metadata

-- Unit catalogue extensions
ALTER TABLE "units" ADD COLUMN IF NOT EXISTS "category" text NOT NULL DEFAULT 'count';
ALTER TABLE "units" ADD COLUMN IF NOT EXISTS "allow_decimals" boolean NOT NULL DEFAULT false;

-- Product-specific UOM (factor = how many stock units per 1 of this unit)
CREATE TABLE IF NOT EXISTS "product_units" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "business_id" uuid NOT NULL REFERENCES "businesses"("id") ON DELETE CASCADE,
  "product_id" uuid NOT NULL REFERENCES "products"("id") ON DELETE CASCADE,
  "unit_id" uuid NOT NULL REFERENCES "units"("id") ON DELETE RESTRICT,
  "factor_to_stock" numeric(18, 6) NOT NULL DEFAULT '1',
  "is_stock_unit" boolean NOT NULL DEFAULT false,
  "is_purchase_default" boolean NOT NULL DEFAULT false,
  "is_sales_default" boolean NOT NULL DEFAULT false,
  "allow_purchase" boolean NOT NULL DEFAULT true,
  "allow_sale" boolean NOT NULL DEFAULT true,
  "barcode" text,
  "active" boolean NOT NULL DEFAULT true,
  "valid_from" timestamp DEFAULT now() NOT NULL,
  "valid_to" timestamp,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL,
  CONSTRAINT "product_units_factor_positive" CHECK (factor_to_stock > 0)
);

CREATE UNIQUE INDEX IF NOT EXISTS "product_units_product_unit_active_unique"
  ON "product_units" ("product_id", "unit_id")
  WHERE "valid_to" IS NULL AND "active" = true;

CREATE INDEX IF NOT EXISTS "product_units_business_idx" ON "product_units" ("business_id");
CREATE INDEX IF NOT EXISTS "product_units_product_idx" ON "product_units" ("product_id");

-- Backfill product_units from existing product unit FKs (factor 1)
INSERT INTO "product_units" (
  "business_id", "product_id", "unit_id", "factor_to_stock",
  "is_stock_unit", "is_purchase_default", "is_sales_default",
  "allow_purchase", "allow_sale", "active"
)
SELECT
  p.business_id,
  p.id,
  p.stock_unit_id,
  1,
  true,
  false,
  false,
  true,
  true,
  true
FROM products p
WHERE p.stock_unit_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM product_units pu
    WHERE pu.product_id = p.id AND pu.unit_id = p.stock_unit_id AND pu.valid_to IS NULL
  );

INSERT INTO "product_units" (
  "business_id", "product_id", "unit_id", "factor_to_stock",
  "is_stock_unit", "is_purchase_default", "is_sales_default",
  "allow_purchase", "allow_sale", "active"
)
SELECT
  p.business_id,
  p.id,
  p.purchase_unit_id,
  1,
  false,
  true,
  false,
  true,
  true,
  true
FROM products p
WHERE p.purchase_unit_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM product_units pu
    WHERE pu.product_id = p.id AND pu.unit_id = p.purchase_unit_id AND pu.valid_to IS NULL
  );

INSERT INTO "product_units" (
  "business_id", "product_id", "unit_id", "factor_to_stock",
  "is_stock_unit", "is_purchase_default", "is_sales_default",
  "allow_purchase", "allow_sale", "active"
)
SELECT
  p.business_id,
  p.id,
  p.sales_unit_id,
  1,
  false,
  false,
  true,
  true,
  true,
  true
FROM products p
WHERE p.sales_unit_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM product_units pu
    WHERE pu.product_id = p.id AND pu.unit_id = p.sales_unit_id AND pu.valid_to IS NULL
  );

-- Stock movement audit: entered unit + factor snapshot (quantity remains stock units)
ALTER TABLE "stock_movements" ADD COLUMN IF NOT EXISTS "entered_unit_id" uuid REFERENCES "units"("id");
ALTER TABLE "stock_movements" ADD COLUMN IF NOT EXISTS "quantity_entered" numeric(18, 6);
ALTER TABLE "stock_movements" ADD COLUMN IF NOT EXISTS "conversion_factor" numeric(18, 6);

-- Sale lines: optional sales unit + stock qty snapshot
ALTER TABLE "sale_items" ADD COLUMN IF NOT EXISTS "unit_id" uuid REFERENCES "units"("id");
ALTER TABLE "sale_items" ADD COLUMN IF NOT EXISTS "quantity_entered" numeric(18, 6);
ALTER TABLE "sale_items" ADD COLUMN IF NOT EXISTS "quantity_stock" integer;
ALTER TABLE "sale_items" ADD COLUMN IF NOT EXISTS "conversion_factor" numeric(18, 6);

-- Price per unit (nullable = legacy = product default sales unit)
ALTER TABLE "product_prices" ADD COLUMN IF NOT EXISTS "unit_id" uuid REFERENCES "units"("id");

CREATE INDEX IF NOT EXISTS "product_prices_unit_idx" ON "product_prices" ("unit_id");
