CREATE TYPE "public"."activity_action" AS ENUM('CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT', 'APPROVE', 'REJECT', 'VOID', 'RETURN', 'PAY', 'PRINT', 'EXPORT');--> statement-breakpoint
CREATE TYPE "public"."entity_type" AS ENUM('BUSINESS', 'USER', 'ROLE', 'PRODUCT', 'CATEGORY', 'SUPPLIER', 'PURCHASE_ORDER', 'GOODS_RECEIPT', 'SALE', 'PAYMENT', 'CUSTOMER', 'PRESCRIPTION', 'EXPENSE', 'SETTING');--> statement-breakpoint
CREATE TYPE "public"."return_reason" AS ENUM('DAMAGED', 'EXPIRED', 'WRONG_ITEM', 'RECALL', 'OVER_SUPPLIED', 'OTHER');--> statement-breakpoint
CREATE TYPE "public"."sale_return_reason" AS ENUM('DAMAGED', 'DEFECTIVE', 'EXPIRED', 'WRONG_ITEM', 'CUSTOMER_CHANGED_MIND', 'PRICE_ADJUSTMENT', 'OTHER');--> statement-breakpoint
ALTER TYPE "public"."payment_method" ADD VALUE 'MOBILE_MONEY';--> statement-breakpoint
ALTER TYPE "public"."payment_method" ADD VALUE 'GIFT_VOUCHER';--> statement-breakpoint
CREATE TABLE "goods_receipts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"business_id" uuid NOT NULL,
	"purchase_order_id" uuid,
	"supplier_id" uuid NOT NULL,
	"receipt_number" text NOT NULL,
	"supplier_invoice_number" text,
	"status" "goods_receipt_status" DEFAULT 'DRAFT' NOT NULL,
	"subtotal" numeric(12, 2) DEFAULT '0',
	"tax" numeric(12, 2) DEFAULT '0',
	"total" numeric(12, 2) DEFAULT '0',
	"received_by" uuid,
	"notes" text,
	"received_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "goods_receipt_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"goods_receipt_id" uuid NOT NULL,
	"product_id" uuid NOT NULL,
	"batch_number" text,
	"expiry_date" date,
	"quantity" integer NOT NULL,
	"unit_cost" numeric(12, 2) NOT NULL,
	"total" numeric(12, 2) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "supplier_returns" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"business_id" uuid NOT NULL,
	"supplier_id" uuid NOT NULL,
	"return_number" text NOT NULL,
	"reason" "return_reason" DEFAULT 'OTHER' NOT NULL,
	"subtotal" numeric(12, 2) DEFAULT '0',
	"tax" numeric(12, 2) DEFAULT '0',
	"total" numeric(12, 2) DEFAULT '0',
	"created_by" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "supplier_return_items" (
	"supplier_return_id" uuid NOT NULL,
	"product_id" uuid NOT NULL,
	"product_batch_id" uuid,
	"quantity" integer NOT NULL,
	"unit_cost" numeric(12, 2) NOT NULL,
	"total" numeric(12, 2) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "customers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"business_id" uuid NOT NULL,
	"customer_number" text,
	"first_name" text NOT NULL,
	"last_name" text,
	"phone" text,
	"email" text,
	"id_number" text,
	"address" text,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sales" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"business_id" uuid NOT NULL,
	"customer_id" uuid,
	"invoice_number" text NOT NULL,
	"status" "sale_status" DEFAULT 'COMPLETED' NOT NULL,
	"subtotal" numeric(12, 2) DEFAULT '0',
	"discount" numeric(12, 2) DEFAULT '0',
	"tax" numeric(12, 2) DEFAULT '0',
	"total" numeric(12, 2) DEFAULT '0',
	"notes" text,
	"sold_by" uuid NOT NULL,
	"sold_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sale_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"sale_id" uuid NOT NULL,
	"product_id" uuid NOT NULL,
	"quantity" integer NOT NULL,
	"unit_price" numeric(12, 2) NOT NULL,
	"discount" numeric(12, 2) DEFAULT '0',
	"tax" numeric(12, 2) DEFAULT '0',
	"total" numeric(12, 2) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sale_item_batches" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"sale_item_id" uuid NOT NULL,
	"product_batch_id" uuid NOT NULL,
	"quantity" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "payments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"business_id" uuid NOT NULL,
	"sale_id" uuid NOT NULL,
	"method" "payment_method" NOT NULL,
	"status" "payment_status" DEFAULT 'COMPLETED' NOT NULL,
	"amount" numeric(12, 2) NOT NULL,
	"reference" text,
	"paid_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"received_by" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sale_returns" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"business_id" uuid NOT NULL,
	"sale_id" uuid NOT NULL,
	"customer_id" uuid,
	"return_number" text NOT NULL,
	"reason" "sale_return_reason" DEFAULT 'OTHER' NOT NULL,
	"subtotal" numeric(12, 2) DEFAULT '0',
	"tax" numeric(12, 2) DEFAULT '0',
	"total" numeric(12, 2) DEFAULT '0',
	"created_by" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"approved_by" uuid
);
--> statement-breakpoint
CREATE TABLE "sale_return_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"sale_return_id" uuid NOT NULL,
	"sale_item_id" uuid NOT NULL,
	"product_batch_id" uuid,
	"quantity" integer NOT NULL,
	"unit_price" numeric(12, 2) NOT NULL,
	"total" numeric(12, 2) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "activity_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"business_id" uuid NOT NULL,
	"user_id" uuid,
	"action" "activity_action" NOT NULL,
	"entity" "entity_type" NOT NULL,
	"entity_id" uuid,
	"description" text,
	"ip_address" text,
	"user_agent" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "login_history" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"business_id" uuid NOT NULL,
	"user_id" uuid,
	"login_time" timestamp DEFAULT now() NOT NULL,
	"logout_time" timestamp,
	"successful" boolean DEFAULT true NOT NULL,
	"ip_address" text,
	"user_agent" text
);
--> statement-breakpoint
CREATE TABLE "api_keys" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"business_id" uuid NOT NULL,
	"name" text NOT NULL,
	"key_hash" text NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"last_used_at" timestamp,
	"expires_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "payments" ALTER COLUMN "status" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "payments" ALTER COLUMN "status" SET DEFAULT 'COMPLETED'::text;--> statement-breakpoint
DROP TYPE "public"."payment_status";--> statement-breakpoint
CREATE TYPE "public"."payment_status" AS ENUM('PENDING', 'PARTIAL', 'COMPLETED', 'FAILED', 'REVERSED', 'REFUNDED');--> statement-breakpoint
ALTER TABLE "payments" ALTER COLUMN "status" SET DEFAULT 'COMPLETED'::"public"."payment_status";--> statement-breakpoint
ALTER TABLE "payments" ALTER COLUMN "status" SET DATA TYPE "public"."payment_status" USING "status"::"public"."payment_status";--> statement-breakpoint
ALTER TABLE "goods_receipts" ADD CONSTRAINT "goods_receipts_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "goods_receipts" ADD CONSTRAINT "goods_receipts_purchase_order_id_purchase_orders_id_fk" FOREIGN KEY ("purchase_order_id") REFERENCES "public"."purchase_orders"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "goods_receipts" ADD CONSTRAINT "goods_receipts_supplier_id_suppliers_id_fk" FOREIGN KEY ("supplier_id") REFERENCES "public"."suppliers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "goods_receipts" ADD CONSTRAINT "goods_receipts_received_by_users_id_fk" FOREIGN KEY ("received_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "goods_receipt_items" ADD CONSTRAINT "goods_receipt_items_goods_receipt_id_goods_receipts_id_fk" FOREIGN KEY ("goods_receipt_id") REFERENCES "public"."goods_receipts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "goods_receipt_items" ADD CONSTRAINT "goods_receipt_items_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "supplier_returns" ADD CONSTRAINT "supplier_returns_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "supplier_returns" ADD CONSTRAINT "supplier_returns_supplier_id_suppliers_id_fk" FOREIGN KEY ("supplier_id") REFERENCES "public"."suppliers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "supplier_returns" ADD CONSTRAINT "supplier_returns_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "supplier_return_items" ADD CONSTRAINT "supplier_return_items_supplier_return_id_supplier_returns_id_fk" FOREIGN KEY ("supplier_return_id") REFERENCES "public"."supplier_returns"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "supplier_return_items" ADD CONSTRAINT "supplier_return_items_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "supplier_return_items" ADD CONSTRAINT "supplier_return_items_product_batch_id_product_batches_id_fk" FOREIGN KEY ("product_batch_id") REFERENCES "public"."product_batches"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "customers" ADD CONSTRAINT "customers_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sales" ADD CONSTRAINT "sales_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sales" ADD CONSTRAINT "sales_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sales" ADD CONSTRAINT "sales_sold_by_users_id_fk" FOREIGN KEY ("sold_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sale_items" ADD CONSTRAINT "sale_items_sale_id_sales_id_fk" FOREIGN KEY ("sale_id") REFERENCES "public"."sales"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sale_items" ADD CONSTRAINT "sale_items_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sale_item_batches" ADD CONSTRAINT "sale_item_batches_sale_item_id_sale_items_id_fk" FOREIGN KEY ("sale_item_id") REFERENCES "public"."sale_items"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sale_item_batches" ADD CONSTRAINT "sale_item_batches_product_batch_id_product_batches_id_fk" FOREIGN KEY ("product_batch_id") REFERENCES "public"."product_batches"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_sale_id_sales_id_fk" FOREIGN KEY ("sale_id") REFERENCES "public"."sales"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_received_by_users_id_fk" FOREIGN KEY ("received_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sale_returns" ADD CONSTRAINT "sale_returns_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sale_returns" ADD CONSTRAINT "sale_returns_sale_id_sales_id_fk" FOREIGN KEY ("sale_id") REFERENCES "public"."sales"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sale_returns" ADD CONSTRAINT "sale_returns_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sale_returns" ADD CONSTRAINT "sale_returns_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sale_returns" ADD CONSTRAINT "sale_returns_approved_by_users_id_fk" FOREIGN KEY ("approved_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sale_return_items" ADD CONSTRAINT "sale_return_items_sale_return_id_sale_returns_id_fk" FOREIGN KEY ("sale_return_id") REFERENCES "public"."sale_returns"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sale_return_items" ADD CONSTRAINT "sale_return_items_sale_item_id_sale_items_id_fk" FOREIGN KEY ("sale_item_id") REFERENCES "public"."sale_items"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sale_return_items" ADD CONSTRAINT "sale_return_items_product_batch_id_product_batches_id_fk" FOREIGN KEY ("product_batch_id") REFERENCES "public"."product_batches"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "activity_logs" ADD CONSTRAINT "activity_logs_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "activity_logs" ADD CONSTRAINT "activity_logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "login_history" ADD CONSTRAINT "login_history_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "login_history" ADD CONSTRAINT "login_history_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "api_keys" ADD CONSTRAINT "api_keys_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "grn_business_idx" ON "goods_receipts" USING btree ("business_id");--> statement-breakpoint
CREATE INDEX "grn_supplier_idx" ON "goods_receipts" USING btree ("supplier_id");--> statement-breakpoint
CREATE INDEX "grn_po_idx" ON "goods_receipts" USING btree ("purchase_order_id");--> statement-breakpoint
CREATE INDEX "grn_number_idx" ON "goods_receipts" USING btree ("receipt_number");--> statement-breakpoint
CREATE INDEX "gri_receipt_idx" ON "goods_receipt_items" USING btree ("goods_receipt_id");--> statement-breakpoint
CREATE INDEX "gri_product_idx" ON "goods_receipt_items" USING btree ("product_id");--> statement-breakpoint
CREATE INDEX "supplier_return_business_idx" ON "supplier_returns" USING btree ("business_id");--> statement-breakpoint
CREATE INDEX "supplier_return_supplier_idx" ON "supplier_returns" USING btree ("supplier_id");--> statement-breakpoint
CREATE INDEX "supplier_return_number_idx" ON "supplier_returns" USING btree ("return_number");--> statement-breakpoint
CREATE INDEX "supplier_return_item_return_idx" ON "supplier_return_items" USING btree ("supplier_return_id");--> statement-breakpoint
CREATE INDEX "supplier_return_item_product_idx" ON "supplier_return_items" USING btree ("product_id");--> statement-breakpoint
CREATE INDEX "customers_business_idx" ON "customers" USING btree ("business_id");--> statement-breakpoint
CREATE INDEX "customers_phone_idx" ON "customers" USING btree ("phone");--> statement-breakpoint
CREATE INDEX "customers_email_idx" ON "customers" USING btree ("email");--> statement-breakpoint
CREATE INDEX "sales_business_idx" ON "sales" USING btree ("business_id");--> statement-breakpoint
CREATE INDEX "sales_customer_idx" ON "sales" USING btree ("customer_id");--> statement-breakpoint
CREATE INDEX "sales_invoice_idx" ON "sales" USING btree ("invoice_number");--> statement-breakpoint
CREATE INDEX "sales_sold_by_idx" ON "sales" USING btree ("sold_by");--> statement-breakpoint
CREATE INDEX "sales_status_idx" ON "sales" USING btree ("status");--> statement-breakpoint
CREATE INDEX "sale_items_sale_idx" ON "sale_items" USING btree ("sale_id");--> statement-breakpoint
CREATE INDEX "sale_items_product_idx" ON "sale_items" USING btree ("product_id");--> statement-breakpoint
CREATE INDEX "sib_sale_item_idx" ON "sale_item_batches" USING btree ("sale_item_id");--> statement-breakpoint
CREATE INDEX "sib_batch_idx" ON "sale_item_batches" USING btree ("product_batch_id");--> statement-breakpoint
CREATE INDEX "payments_business_idx" ON "payments" USING btree ("business_id");--> statement-breakpoint
CREATE INDEX "payments_sale_idx" ON "payments" USING btree ("sale_id");--> statement-breakpoint
CREATE INDEX "payments_method_idx" ON "payments" USING btree ("method");--> statement-breakpoint
CREATE INDEX "payments_status_idx" ON "payments" USING btree ("status");--> statement-breakpoint
CREATE INDEX "sale_returns_business_idx" ON "sale_returns" USING btree ("business_id");--> statement-breakpoint
CREATE INDEX "sale_returns_sale_idx" ON "sale_returns" USING btree ("sale_id");--> statement-breakpoint
CREATE INDEX "sale_returns_customer_idx" ON "sale_returns" USING btree ("customer_id");--> statement-breakpoint
CREATE INDEX "sale_returns_number_idx" ON "sale_returns" USING btree ("return_number");--> statement-breakpoint
CREATE INDEX "sale_return_items_return_idx" ON "sale_return_items" USING btree ("sale_return_id");--> statement-breakpoint
CREATE INDEX "sale_return_items_sale_item_idx" ON "sale_return_items" USING btree ("sale_item_id");--> statement-breakpoint
CREATE INDEX "sale_return_items_batch_idx" ON "sale_return_items" USING btree ("product_batch_id");--> statement-breakpoint
CREATE INDEX "activity_logs_business_idx" ON "activity_logs" USING btree ("business_id");--> statement-breakpoint
CREATE INDEX "activity_logs_user_idx" ON "activity_logs" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "activity_logs_entity_idx" ON "activity_logs" USING btree ("entity");--> statement-breakpoint
CREATE INDEX "activity_logs_created_idx" ON "activity_logs" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "login_history_business_idx" ON "login_history" USING btree ("business_id");--> statement-breakpoint
CREATE INDEX "login_history_user_idx" ON "login_history" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "api_keys_business_idx" ON "api_keys" USING btree ("business_id");--> statement-breakpoint
CREATE INDEX "api_keys_active_idx" ON "api_keys" USING btree ("active");