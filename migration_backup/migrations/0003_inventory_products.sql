CREATE TABLE "products" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"business_id" uuid NOT NULL,
	"category_id" uuid NOT NULL,
	"supplier_id" uuid,
	"name" text NOT NULL,
	"generic_name" text,
	"brand" text,
	"description" text,
	"sku" text,
	"barcode" text,
	"dosage_form" text,
	"strength" text,
	"pack_size" text,
	"requires_prescription" boolean DEFAULT false NOT NULL,
	"selling_price" numeric(12, 2) NOT NULL,
	"tax_rate" numeric(5, 2) DEFAULT '0.00',
	"track_inventory" boolean DEFAULT true NOT NULL,
	"track_batch" boolean DEFAULT true NOT NULL,
	"track_expiry" boolean DEFAULT true NOT NULL,
	"minimum_stock" integer DEFAULT 0 NOT NULL,
	"reorder_level" integer DEFAULT 0 NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_supplier_id_suppliers_id_fk" FOREIGN KEY ("supplier_id") REFERENCES "public"."suppliers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "products_business_idx" ON "products" USING btree ("business_id");--> statement-breakpoint
CREATE INDEX "products_category_idx" ON "products" USING btree ("category_id");--> statement-breakpoint
CREATE INDEX "products_supplier_idx" ON "products" USING btree ("supplier_id");--> statement-breakpoint
CREATE UNIQUE INDEX "products_barcode_unique" ON "products" USING btree ("business_id","barcode");--> statement-breakpoint
CREATE UNIQUE INDEX "products_sku_unique" ON "products" USING btree ("business_id","sku");--> statement-breakpoint
CREATE INDEX "products_name_idx" ON "products" USING btree ("business_id","name");