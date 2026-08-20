CREATE TABLE IF NOT EXISTS "product_serials" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "business_id" uuid NOT NULL REFERENCES "businesses"("id") ON DELETE cascade,
  "product_id" uuid NOT NULL REFERENCES "products"("id") ON DELETE cascade,
  "batch_id" uuid NOT NULL REFERENCES "product_batches"("id") ON DELETE cascade,
  "warehouse_id" uuid NOT NULL REFERENCES "warehouses"("id") ON DELETE cascade,
  "serial_number" text NOT NULL,
  "status" text DEFAULT 'IN_STOCK' NOT NULL,
  "received_at" timestamp DEFAULT now() NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "product_serials_business_idx"
  ON "product_serials" USING btree ("business_id");
CREATE INDEX IF NOT EXISTS "product_serials_product_idx"
  ON "product_serials" USING btree ("product_id");
CREATE INDEX IF NOT EXISTS "product_serials_batch_idx"
  ON "product_serials" USING btree ("batch_id");
CREATE INDEX IF NOT EXISTS "product_serials_warehouse_idx"
  ON "product_serials" USING btree ("warehouse_id");
CREATE INDEX IF NOT EXISTS "product_serials_status_idx"
  ON "product_serials" USING btree ("status");
CREATE UNIQUE INDEX IF NOT EXISTS "product_serials_business_serial_unique"
  ON "product_serials" USING btree ("business_id", "serial_number");
