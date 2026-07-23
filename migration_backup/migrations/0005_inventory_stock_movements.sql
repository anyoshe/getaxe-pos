CREATE TABLE "stock_movements" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"business_id" uuid NOT NULL,
	"product_id" uuid NOT NULL,
	"batch_id" uuid,
	"user_id" uuid,
	"movement_type" text NOT NULL,
	"quantity" integer NOT NULL,
	"unit_cost" numeric(12, 2),
	"reference" text,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "stock_movements" ADD CONSTRAINT "stock_movements_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stock_movements" ADD CONSTRAINT "stock_movements_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stock_movements" ADD CONSTRAINT "stock_movements_batch_id_product_batches_id_fk" FOREIGN KEY ("batch_id") REFERENCES "public"."product_batches"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stock_movements" ADD CONSTRAINT "stock_movements_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "stock_business_idx" ON "stock_movements" USING btree ("business_id");--> statement-breakpoint
CREATE INDEX "stock_product_idx" ON "stock_movements" USING btree ("product_id");--> statement-breakpoint
CREATE INDEX "stock_batch_idx" ON "stock_movements" USING btree ("batch_id");--> statement-breakpoint
CREATE INDEX "stock_user_idx" ON "stock_movements" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "stock_type_idx" ON "stock_movements" USING btree ("movement_type");--> statement-breakpoint
CREATE INDEX "stock_created_idx" ON "stock_movements" USING btree ("created_at");