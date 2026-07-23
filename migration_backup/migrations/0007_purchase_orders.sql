CREATE TYPE "public"."expense_status" AS ENUM('PENDING', 'APPROVED', 'PAID', 'REJECTED');--> statement-breakpoint
CREATE TYPE "public"."goods_receipt_status" AS ENUM('DRAFT', 'POSTED', 'CANCELLED');--> statement-breakpoint
CREATE TYPE "public"."payment_method" AS ENUM('CASH', 'MPESA', 'CARD', 'BANK_TRANSFER', 'CHEQUE', 'CREDIT');--> statement-breakpoint
CREATE TYPE "public"."payment_status" AS ENUM('PENDING', 'PARTIAL', 'PAID', 'FAILED', 'REFUNDED');--> statement-breakpoint
CREATE TYPE "public"."prescription_status" AS ENUM('PENDING', 'PARTIALLY_DISPENSED', 'DISPENSED', 'CANCELLED');--> statement-breakpoint
CREATE TYPE "public"."purchase_order_status" AS ENUM('DRAFT', 'PENDING', 'APPROVED', 'PARTIALLY_RECEIVED', 'RECEIVED', 'CANCELLED');--> statement-breakpoint
CREATE TYPE "public"."sale_status" AS ENUM('DRAFT', 'COMPLETED', 'VOIDED', 'REFUNDED');--> statement-breakpoint
CREATE TABLE "purchase_order_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"purchase_order_id" uuid NOT NULL,
	"product_id" uuid NOT NULL,
	"quantity" integer NOT NULL,
	"received_quantity" integer DEFAULT 0 NOT NULL,
	"unit_cost" numeric(12, 2) NOT NULL,
	"discount" numeric(12, 2) DEFAULT '0',
	"tax" numeric(12, 2) DEFAULT '0',
	"total" numeric(12, 2) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "purchase_orders" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"business_id" uuid NOT NULL,
	"supplier_id" uuid NOT NULL,
	"order_number" text NOT NULL,
	"status" "purchase_order_status" DEFAULT 'DRAFT' NOT NULL,
	"subtotal" numeric(12, 2) DEFAULT '0',
	"discount" numeric(12, 2) DEFAULT '0',
	"tax" numeric(12, 2) DEFAULT '0',
	"total" numeric(12, 2) DEFAULT '0',
	"notes" text,
	"ordered_by" uuid,
	"approved_by" uuid,
	"ordered_at" timestamp DEFAULT now() NOT NULL,
	"approved_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "businesses" ALTER COLUMN "business_type" SET DATA TYPE text;--> statement-breakpoint
DROP TYPE "public"."business_type";--> statement-breakpoint
CREATE TYPE "public"."business_type" AS ENUM('RETAIL', 'WHOLESALE', 'PHARMACY', 'CHEMIST', 'CLINIC', 'HOSPITAL');--> statement-breakpoint
ALTER TABLE "businesses" ALTER COLUMN "business_type" SET DATA TYPE "public"."business_type" USING "business_type"::"public"."business_type";--> statement-breakpoint
ALTER TABLE "stock_movements" ALTER COLUMN "movement_type" SET DATA TYPE text;--> statement-breakpoint
DROP TYPE "public"."stock_movement_type";--> statement-breakpoint
CREATE TYPE "public"."stock_movement_type" AS ENUM('OPENING_STOCK', 'PURCHASE', 'SALE', 'SALE_RETURN', 'PURCHASE_RETURN', 'ADJUSTMENT', 'TRANSFER_IN', 'TRANSFER_OUT', 'DAMAGED', 'EXPIRED');--> statement-breakpoint
ALTER TABLE "stock_movements" ALTER COLUMN "movement_type" SET DATA TYPE "public"."stock_movement_type" USING "movement_type"::"public"."stock_movement_type";--> statement-breakpoint
ALTER TABLE "purchase_order_items" ADD CONSTRAINT "purchase_order_items_purchase_order_id_purchase_orders_id_fk" FOREIGN KEY ("purchase_order_id") REFERENCES "public"."purchase_orders"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "purchase_order_items" ADD CONSTRAINT "purchase_order_items_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "purchase_orders" ADD CONSTRAINT "purchase_orders_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "purchase_orders" ADD CONSTRAINT "purchase_orders_supplier_id_suppliers_id_fk" FOREIGN KEY ("supplier_id") REFERENCES "public"."suppliers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "purchase_orders" ADD CONSTRAINT "purchase_orders_ordered_by_users_id_fk" FOREIGN KEY ("ordered_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "purchase_orders" ADD CONSTRAINT "purchase_orders_approved_by_users_id_fk" FOREIGN KEY ("approved_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "poi_order_idx" ON "purchase_order_items" USING btree ("purchase_order_id");--> statement-breakpoint
CREATE INDEX "poi_product_idx" ON "purchase_order_items" USING btree ("product_id");--> statement-breakpoint
CREATE INDEX "po_business_idx" ON "purchase_orders" USING btree ("business_id");--> statement-breakpoint
CREATE INDEX "po_supplier_idx" ON "purchase_orders" USING btree ("supplier_id");--> statement-breakpoint
CREATE INDEX "po_order_idx" ON "purchase_orders" USING btree ("order_number");--> statement-breakpoint
CREATE INDEX "po_status_idx" ON "purchase_orders" USING btree ("status");