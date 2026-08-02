CREATE TABLE "inventory_balances" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"business_id" uuid NOT NULL,
	"product_id" uuid NOT NULL,
	"batch_id" uuid,
	"warehouse_id" uuid NOT NULL,
	"quantity" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "sale_items" DROP CONSTRAINT "sale_items_product_batch_id_product_batches_id_fk";
--> statement-breakpoint
DROP INDEX "sale_items_product_batch_idx";--> statement-breakpoint
ALTER TABLE "sales" ADD COLUMN "amount_paid" numeric(12, 2) DEFAULT '0' NOT NULL;--> statement-breakpoint
ALTER TABLE "sales" ADD COLUMN "balance_due" numeric(12, 2) DEFAULT '0' NOT NULL;--> statement-breakpoint
ALTER TABLE "sales" ADD COLUMN "payment_status" "payment_status" DEFAULT 'PENDING' NOT NULL;--> statement-breakpoint
ALTER TABLE "inventory_balances" ADD CONSTRAINT "inventory_balances_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inventory_balances" ADD CONSTRAINT "inventory_balances_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inventory_balances" ADD CONSTRAINT "inventory_balances_batch_id_product_batches_id_fk" FOREIGN KEY ("batch_id") REFERENCES "public"."product_batches"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inventory_balances" ADD CONSTRAINT "inventory_balances_warehouse_id_warehouses_id_fk" FOREIGN KEY ("warehouse_id") REFERENCES "public"."warehouses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "inventory_balances_business_idx" ON "inventory_balances" USING btree ("business_id");--> statement-breakpoint
CREATE INDEX "inventory_balances_product_idx" ON "inventory_balances" USING btree ("product_id");--> statement-breakpoint
CREATE INDEX "inventory_balances_warehouse_idx" ON "inventory_balances" USING btree ("warehouse_id");--> statement-breakpoint
CREATE INDEX "inventory_balance_business_product_warehouse_idx" ON "inventory_balances" USING btree ("business_id","product_id","warehouse_id");--> statement-breakpoint
CREATE UNIQUE INDEX "inventory_balance_product_batch_warehouse_unique" ON "inventory_balances" USING btree ("product_id","batch_id","warehouse_id");--> statement-breakpoint
ALTER TABLE "sale_items" DROP COLUMN "product_batch_id";