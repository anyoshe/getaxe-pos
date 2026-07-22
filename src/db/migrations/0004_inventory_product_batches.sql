CREATE TABLE "product_batches" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"business_id" uuid NOT NULL,
	"product_id" uuid NOT NULL,
	"supplier_id" uuid,
	"batch_number" text NOT NULL,
	"manufacture_date" date,
	"expiry_date" date,
	"purchase_invoice" text,
	"cost_price" numeric(12, 2) NOT NULL,
	"selling_price" numeric(12, 2),
	"quantity_received" integer NOT NULL,
	"quantity_remaining" integer NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "product_batches" ADD CONSTRAINT "product_batches_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_batches" ADD CONSTRAINT "product_batches_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_batches" ADD CONSTRAINT "product_batches_supplier_id_suppliers_id_fk" FOREIGN KEY ("supplier_id") REFERENCES "public"."suppliers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "batch_business_idx" ON "product_batches" USING btree ("business_id");--> statement-breakpoint
CREATE INDEX "batch_product_idx" ON "product_batches" USING btree ("product_id");--> statement-breakpoint
CREATE INDEX "batch_supplier_idx" ON "product_batches" USING btree ("supplier_id");--> statement-breakpoint
CREATE INDEX "batch_expiry_idx" ON "product_batches" USING btree ("expiry_date");--> statement-breakpoint
CREATE UNIQUE INDEX "product_batch_unique" ON "product_batches" USING btree ("business_id","product_id","batch_number");