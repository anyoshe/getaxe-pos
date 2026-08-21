CREATE TABLE IF NOT EXISTS "product_serials" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "business_id" uuid NOT NULL,
  "product_id" uuid NOT NULL,
  "batch_id" uuid,
  "warehouse_id" uuid NOT NULL,
  "serial_number" text NOT NULL,
  "status" text DEFAULT 'AVAILABLE' NOT NULL,
  "stock_movement_id" uuid,
  "notes" text,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);

ALTER TABLE "product_serials"
  ADD CONSTRAINT "product_serials_business_id_businesses_id_fk"
  FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE cascade ON UPDATE no action;

ALTER TABLE "product_serials"
  ADD CONSTRAINT "product_serials_product_id_products_id_fk"
  FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;

ALTER TABLE "product_serials"
  ADD CONSTRAINT "product_serials_batch_id_product_batches_id_fk"
  FOREIGN KEY ("batch_id") REFERENCES "public"."product_batches"("id") ON DELETE set null ON UPDATE no action;

ALTER TABLE "product_serials"
  ADD CONSTRAINT "product_serials_warehouse_id_warehouses_id_fk"
  FOREIGN KEY ("warehouse_id") REFERENCES "public"."warehouses"("id") ON DELETE cascade ON UPDATE no action;

ALTER TABLE "product_serials"
  ADD CONSTRAINT "product_serials_stock_movement_id_stock_movements_id_fk"
  FOREIGN KEY ("stock_movement_id") REFERENCES "public"."stock_movements"("id") ON DELETE set null ON UPDATE no action;

CREATE INDEX IF NOT EXISTS "product_serials_business_idx" ON "product_serials" USING btree ("business_id");
CREATE INDEX IF NOT EXISTS "product_serials_product_idx" ON "product_serials" USING btree ("product_id");
CREATE INDEX IF NOT EXISTS "product_serials_batch_idx" ON "product_serials" USING btree ("batch_id");
CREATE INDEX IF NOT EXISTS "product_serials_warehouse_idx" ON "product_serials" USING btree ("warehouse_id");
CREATE INDEX IF NOT EXISTS "product_serials_status_idx" ON "product_serials" USING btree ("status");
CREATE UNIQUE INDEX IF NOT EXISTS "product_serials_business_serial_unique" ON "product_serials" USING btree ("business_id", "serial_number");
