ALTER TABLE "journal_entry_lines" DROP CONSTRAINT "journal_entry_lines_debit_credit_check";--> statement-breakpoint
ALTER TABLE "supplier_return_items" ADD COLUMN "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL;--> statement-breakpoint
ALTER TABLE "sales" ADD COLUMN "branch_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "sales" ADD COLUMN "warehouse_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "sale_items" ADD COLUMN "product_batch_id" uuid;--> statement-breakpoint
ALTER TABLE "sales" ADD CONSTRAINT "sales_branch_id_branches_id_fk" FOREIGN KEY ("branch_id") REFERENCES "public"."branches"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sales" ADD CONSTRAINT "sales_warehouse_id_warehouses_id_fk" FOREIGN KEY ("warehouse_id") REFERENCES "public"."warehouses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sale_items" ADD CONSTRAINT "sale_items_product_batch_id_product_batches_id_fk" FOREIGN KEY ("product_batch_id") REFERENCES "public"."product_batches"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "sales_branch_idx" ON "sales" USING btree ("branch_id");--> statement-breakpoint
CREATE INDEX "sales_warehouse_idx" ON "sales" USING btree ("warehouse_id");--> statement-breakpoint
CREATE INDEX "sale_items_product_batch_idx" ON "sale_items" USING btree ("product_batch_id");--> statement-breakpoint
CREATE UNIQUE INDEX "api_keys_hash_unique" ON "api_keys" USING btree ("key_hash");--> statement-breakpoint
CREATE UNIQUE INDEX "insurance_claim_items_claim_line_unique" ON "insurance_claim_items" USING btree ("claim_id","line_number");--> statement-breakpoint
ALTER TABLE "journal_entry_lines" ADD CONSTRAINT "journal_entry_lines_debit_credit_check" CHECK (
    (
      ("journal_entry_lines"."debit" > 0 AND "journal_entry_lines"."credit" = 0)
      OR
      ("journal_entry_lines"."credit" > 0 AND "journal_entry_lines"."debit" = 0)
    )
  );