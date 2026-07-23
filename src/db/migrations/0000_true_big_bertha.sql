CREATE TYPE "public"."activity_action" AS ENUM('CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT', 'APPROVE', 'REJECT', 'VOID', 'RETURN', 'PAY', 'PRINT', 'EXPORT');--> statement-breakpoint
CREATE TYPE "public"."blood_group" AS ENUM('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-');--> statement-breakpoint
CREATE TYPE "public"."business_type" AS ENUM('RETAIL', 'WHOLESALE', 'PHARMACY', 'CHEMIST', 'CLINIC', 'HOSPITAL');--> statement-breakpoint
CREATE TYPE "public"."cash_account_type" AS ENUM('CASH', 'BANK', 'MPESA', 'MOBILE_MONEY', 'PETTY_CASH');--> statement-breakpoint
CREATE TYPE "public"."consultation_status" AS ENUM('OPEN', 'COMPLETED', 'REFERRED', 'CANCELLED');--> statement-breakpoint
CREATE TYPE "public"."customer_type" AS ENUM('INDIVIDUAL', 'BUSINESS');--> statement-breakpoint
CREATE TYPE "public"."diagnosis_type" AS ENUM('PRIMARY', 'SECONDARY', 'PROVISIONAL', 'DIFFERENTIAL');--> statement-breakpoint
CREATE TYPE "public"."dispensation_status" AS ENUM('PENDING', 'PARTIALLY_DISPENSED', 'DISPENSED', 'CANCELLED');--> statement-breakpoint
CREATE TYPE "public"."dispensing_level" AS ENUM('OTC', 'PRESCRIPTION', 'CONTROLLED', 'NARCOTIC');--> statement-breakpoint
CREATE TYPE "public"."document_type" AS ENUM('SALE', 'PURCHASE_ORDER', 'GOODS_RECEIPT', 'SUPPLIER_RETURN', 'SALE_RETURN', 'PAYMENT', 'EXPENSE', 'INCOME', 'JOURNAL', 'STOCK_TRANSFER', 'STOCK_ADJUSTMENT');--> statement-breakpoint
CREATE TYPE "public"."entity_type" AS ENUM('BUSINESS', 'USER', 'ROLE', 'PRODUCT', 'CATEGORY', 'SUPPLIER', 'PURCHASE_ORDER', 'GOODS_RECEIPT', 'SALE', 'PAYMENT', 'CUSTOMER', 'PRESCRIPTION', 'EXPENSE', 'SETTING');--> statement-breakpoint
CREATE TYPE "public"."expense_status" AS ENUM('PENDING', 'APPROVED', 'PAID', 'CANCELLED');--> statement-breakpoint
CREATE TYPE "public"."gender" AS ENUM('MALE', 'FEMALE', 'OTHER');--> statement-breakpoint
CREATE TYPE "public"."goods_receipt_status" AS ENUM('DRAFT', 'POSTED', 'CANCELLED');--> statement-breakpoint
CREATE TYPE "public"."insurance_claim_status" AS ENUM('DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'PARTIALLY_APPROVED', 'REJECTED', 'PAID', 'CANCELLED');--> statement-breakpoint
CREATE TYPE "public"."journal_source_type" AS ENUM('SALE', 'PURCHASE', 'EXPENSE', 'INCOME', 'PAYMENT', 'RECEIPT', 'PURCHASE_RETURN', 'SALES_RETURN', 'STOCK_ADJUSTMENT', 'STOCK_TRANSFER', 'OPENING_BALANCE', 'MANUAL_JOURNAL');--> statement-breakpoint
CREATE TYPE "public"."journal_status" AS ENUM('DRAFT', 'POSTED', 'REVERSED', 'VOIDED');--> statement-breakpoint
CREATE TYPE "public"."normal_balance" AS ENUM('DEBIT', 'CREDIT');--> statement-breakpoint
CREATE TYPE "public"."payment_method" AS ENUM('CASH', 'MPESA', 'CARD', 'BANK_TRANSFER', 'CHEQUE', 'CREDIT', 'MOBILE_MONEY', 'GIFT_VOUCHER');--> statement-breakpoint
CREATE TYPE "public"."payment_status" AS ENUM('PENDING', 'PARTIAL', 'COMPLETED', 'FAILED', 'REVERSED', 'REFUNDED');--> statement-breakpoint
CREATE TYPE "public"."prescription_status" AS ENUM('PENDING', 'PARTIALLY_DISPENSED', 'DISPENSED', 'CANCELLED', 'EXPIRED');--> statement-breakpoint
CREATE TYPE "public"."purchase_order_status" AS ENUM('DRAFT', 'PENDING', 'APPROVED', 'PARTIALLY_RECEIVED', 'RECEIVED', 'CANCELLED');--> statement-breakpoint
CREATE TYPE "public"."return_reason" AS ENUM('DAMAGED', 'EXPIRED', 'WRONG_ITEM', 'RECALL', 'OVER_SUPPLIED', 'OTHER');--> statement-breakpoint
CREATE TYPE "public"."sale_return_reason" AS ENUM('DAMAGED', 'DEFECTIVE', 'EXPIRED', 'WRONG_ITEM', 'CUSTOMER_CHANGED_MIND', 'PRICE_ADJUSTMENT', 'OTHER');--> statement-breakpoint
CREATE TYPE "public"."sale_status" AS ENUM('DRAFT', 'COMPLETED', 'VOIDED', 'REFUNDED');--> statement-breakpoint
CREATE TYPE "public"."stock_movement_type" AS ENUM('OPENING_STOCK', 'PURCHASE', 'SALE', 'SALE_RETURN', 'PURCHASE_RETURN', 'ADJUSTMENT', 'TRANSFER_IN', 'TRANSFER_OUT', 'DAMAGED', 'EXPIRED');--> statement-breakpoint
CREATE TYPE "public"."transaction_status" AS ENUM('DRAFT', 'PENDING', 'APPROVED', 'COMPLETED', 'VOIDED', 'CANCELLED');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('SUPER_ADMIN', 'ADMIN', 'MANAGER', 'PHARMACIST', 'CASHIER', 'STORE_KEEPER');--> statement-breakpoint
CREATE TABLE "consultation_diagnoses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"consultation_id" uuid NOT NULL,
	"diagnosis_id" uuid NOT NULL,
	"diagnosis_type" "diagnosis_type" DEFAULT 'PRIMARY' NOT NULL,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "consultations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"business_id" uuid NOT NULL,
	"branch_id" uuid NOT NULL,
	"customer_id" uuid NOT NULL,
	"consultation_number" text NOT NULL,
	"clinician_id" uuid NOT NULL,
	"visit_reason" text,
	"history_of_present_illness" text,
	"examination_notes" text,
	"clinical_notes" text,
	"status" "consultation_status" DEFAULT 'OPEN' NOT NULL,
	"consultation_date" timestamp DEFAULT now() NOT NULL,
	"completed_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "diagnoses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"business_id" uuid,
	"code" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "businesses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"legal_name" text,
	"registration_number" text,
	"kra_pin" text,
	"business_type" "business_type" NOT NULL,
	"email" text,
	"phone" text,
	"website" text,
	"country" text DEFAULT 'Kenya' NOT NULL,
	"county" text,
	"town" text,
	"address" text,
	"currency" text DEFAULT 'KES' NOT NULL,
	"timezone" text DEFAULT 'Africa/Nairobi' NOT NULL,
	"logo" text,
	"active" boolean DEFAULT true NOT NULL,
	"created_by" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "account_categories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"business_id" uuid,
	"account_type_id" uuid NOT NULL,
	"code" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"display_order" integer DEFAULT 0 NOT NULL,
	"is_system" boolean DEFAULT true NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "account_types" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"business_id" uuid,
	"code" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"normal_balance" "normal_balance" NOT NULL,
	"display_order" integer DEFAULT 0 NOT NULL,
	"is_system" boolean DEFAULT true NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "cash_accounts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"business_id" uuid NOT NULL,
	"account_id" uuid NOT NULL,
	"name" text NOT NULL,
	"type" "cash_account_type" NOT NULL,
	"account_number" text,
	"bank_name" text,
	"branch_name" text,
	"currency" text DEFAULT 'KES' NOT NULL,
	"opening_balance" numeric(18, 2) DEFAULT '0' NOT NULL,
	"details" jsonb,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "chart_of_accounts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"business_id" uuid NOT NULL,
	"account_category_id" uuid NOT NULL,
	"parent_account_id" uuid,
	"account_code" text NOT NULL,
	"account_name" text NOT NULL,
	"description" text,
	"level" integer DEFAULT 1 NOT NULL,
	"display_order" integer DEFAULT 0 NOT NULL,
	"is_system" boolean DEFAULT false NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "expense_categories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"business_id" uuid NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "expenses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"business_id" uuid NOT NULL,
	"category_id" uuid NOT NULL,
	"cash_account_id" uuid,
	"description" text NOT NULL,
	"amount" numeric(12, 2) NOT NULL,
	"reference" text,
	"status" "expense_status" DEFAULT 'PAID' NOT NULL,
	"paid_to" text,
	"created_by" uuid,
	"expense_date" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "income_categories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"business_id" uuid NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "incomes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"business_id" uuid NOT NULL,
	"category_id" uuid NOT NULL,
	"cash_account_id" uuid,
	"description" text NOT NULL,
	"amount" numeric(18, 2) NOT NULL,
	"reference" text,
	"received_from" text,
	"received_by" uuid,
	"status" "transaction_status" DEFAULT 'COMPLETED' NOT NULL,
	"income_date" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "journal_entries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"business_id" uuid NOT NULL,
	"journal_number" text NOT NULL,
	"transaction_date" timestamp DEFAULT now() NOT NULL,
	"description" text NOT NULL,
	"reference" text,
	"external_reference" text,
	"source_type" "journal_source_type" NOT NULL,
	"source_id" uuid NOT NULL,
	"posted_by" uuid,
	"status" "journal_status" DEFAULT 'POSTED' NOT NULL,
	"is_system_generated" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "journal_entry_lines" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"journal_entry_id" uuid NOT NULL,
	"line_number" integer NOT NULL,
	"account_id" uuid NOT NULL,
	"description" text,
	"debit" numeric(18, 2) DEFAULT '0' NOT NULL,
	"credit" numeric(18, 2) DEFAULT '0' NOT NULL,
	CONSTRAINT "journal_entry_lines_debit_credit_check" CHECK (NOT (
        "journal_entry_lines"."debit" > 0
        AND
        "journal_entry_lines"."credit" > 0
      ))
);
--> statement-breakpoint
CREATE TABLE "tax_rates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"business_id" uuid,
	"code" text NOT NULL,
	"name" text NOT NULL,
	"rate" numeric(5, 2) NOT NULL,
	"description" text,
	"is_default" boolean DEFAULT false NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"business_id" uuid NOT NULL,
	"role_id" uuid NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"phone" text,
	"password_hash" text NOT NULL,
	"last_login_at" timestamp,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "roles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"business_id" uuid,
	"name" text NOT NULL,
	"description" text,
	"is_system" boolean DEFAULT false NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "permissions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" text NOT NULL,
	"name" text NOT NULL,
	"module" text NOT NULL,
	"description" text
);
--> statement-breakpoint
CREATE TABLE "role_permissions" (
	"role_id" uuid NOT NULL,
	"permission_id" uuid NOT NULL,
	CONSTRAINT "role_permissions_role_id_permission_id_pk" PRIMARY KEY("role_id","permission_id")
);
--> statement-breakpoint
CREATE TABLE "categories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"business_id" uuid NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "products" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"business_id" uuid NOT NULL,
	"category_id" uuid NOT NULL,
	"supplier_id" uuid,
	"manufacturer_id" uuid,
	"drug_category_id" uuid,
	"dosage_form_id" uuid,
	"drug_strength_id" uuid,
	"prescription_type_id" uuid,
	"purchase_unit_id" uuid,
	"sales_unit_id" uuid,
	"stock_unit_id" uuid,
	"income_account_id" uuid,
	"expense_account_id" uuid,
	"inventory_account_id" uuid,
	"tax_rate_id" uuid,
	"name" text NOT NULL,
	"generic_name" text,
	"product_brand" text,
	"description" text,
	"sku" text,
	"barcode" text,
	"pack_size" text,
	"cost_price" numeric(12, 2),
	"track_inventory" boolean DEFAULT true NOT NULL,
	"track_batch" boolean DEFAULT false NOT NULL,
	"track_expiry" boolean DEFAULT false NOT NULL,
	"serialized" boolean DEFAULT false NOT NULL,
	"allow_negative_stock" boolean DEFAULT false NOT NULL,
	"minimum_stock" integer DEFAULT 0 NOT NULL,
	"reorder_level" integer DEFAULT 0 NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
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
CREATE TABLE "product_prices" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"business_id" uuid NOT NULL,
	"product_id" uuid NOT NULL,
	"price_list_id" uuid NOT NULL,
	"price" numeric(12, 2) NOT NULL,
	"minimum_quantity" numeric(12, 2) DEFAULT '1' NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "price_lists" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"business_id" uuid NOT NULL,
	"code" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"is_default" boolean DEFAULT false NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "stock_movements" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"business_id" uuid NOT NULL,
	"product_id" uuid NOT NULL,
	"batch_id" uuid,
	"warehouse_id" uuid NOT NULL,
	"user_id" uuid,
	"movement_type" "stock_movement_type" NOT NULL,
	"quantity" integer NOT NULL,
	"unit_cost" numeric(12, 2),
	"reference" text,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "suppliers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"business_id" uuid NOT NULL,
	"name" text NOT NULL,
	"contact_person" text,
	"email" text,
	"phone" text,
	"kra_pin" text,
	"address" text,
	"town" text,
	"notes" text,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
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
	"customer_type" "customer_type" DEFAULT 'INDIVIDUAL' NOT NULL,
	"company_name" text,
	"first_name" text NOT NULL,
	"last_name" text,
	"phone" text,
	"email" text,
	"id_number" text,
	"tax_pin" text,
	"address" text,
	"opening_balance" numeric(12, 2) DEFAULT '0' NOT NULL,
	"credit_limit" numeric(12, 2) DEFAULT '0' NOT NULL,
	"date_of_birth" date,
	"gender" "gender",
	"blood_group" "blood_group",
	"allergies" text,
	"emergency_contact" text,
	"emergency_phone" text,
	"primary_physician" text,
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
	"business_id" uuid NOT NULL,
	"sale_id" uuid NOT NULL,
	"product_id" uuid NOT NULL,
	"quantity" integer NOT NULL,
	"unit_price" numeric(12, 2) NOT NULL,
	"discount" numeric(12, 2) DEFAULT '0',
	"tax" numeric(12, 2) DEFAULT '0',
	"total" numeric(12, 2) NOT NULL,
	CONSTRAINT "sale_items_quantity_positive" CHECK ("sale_items"."quantity" > 0)
);
--> statement-breakpoint
CREATE TABLE "sale_item_batches" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"sale_item_id" uuid NOT NULL,
	"product_batch_id" uuid NOT NULL,
	"quantity" integer NOT NULL,
	CONSTRAINT "sale_item_batch_quantity_positive" CHECK ("sale_item_batches"."quantity" > 0)
);
--> statement-breakpoint
CREATE TABLE "payments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"business_id" uuid NOT NULL,
	"sale_id" uuid NOT NULL,
	"cash_account_id" uuid,
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
	"approved_by" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sale_return_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"sale_return_id" uuid NOT NULL,
	"sale_item_id" uuid NOT NULL,
	"product_batch_id" uuid,
	"quantity" integer NOT NULL,
	"unit_price" numeric(12, 2) NOT NULL,
	"total" numeric(12, 2) NOT NULL,
	CONSTRAINT "sale_return_items_quantity_positive" CHECK ("sale_return_items"."quantity" > 0)
);
--> statement-breakpoint
CREATE TABLE "drug_categories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"business_id" uuid,
	"code" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "drug_strengths" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"business_id" uuid,
	"code" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "dosage_forms" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"business_id" uuid,
	"code" text NOT NULL,
	"name" text NOT NULL,
	"standard_code" text,
	"description" text,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "manufacturers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"business_id" uuid,
	"name" text NOT NULL,
	"country" text,
	"email" text,
	"phone" text,
	"website" text,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "prescription_types" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"business_id" uuid,
	"code" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"dispensing_level" "dispensing_level" NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "prescriptions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"business_id" uuid NOT NULL,
	"customer_id" uuid NOT NULL,
	"consultation_id" uuid,
	"prescription_number" text NOT NULL,
	"doctor_name" text NOT NULL,
	"doctor_license" text,
	"hospital_name" text,
	"prescription_date" date NOT NULL,
	"expiry_date" date,
	"status" "prescription_status" DEFAULT 'PENDING' NOT NULL,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "prescription_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"prescription_id" uuid NOT NULL,
	"product_id" uuid NOT NULL,
	"line_number" integer NOT NULL,
	"dosage" text,
	"frequency" text,
	"duration" text,
	"route" text,
	"quantity_prescribed" numeric(12, 2) NOT NULL,
	"quantity_dispensed" numeric(12, 2) DEFAULT '0' NOT NULL,
	"substitution_allowed" boolean DEFAULT false NOT NULL,
	"dispense_as_written" boolean DEFAULT false NOT NULL,
	"instructions" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "dispensations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"business_id" uuid NOT NULL,
	"branch_id" uuid NOT NULL,
	"warehouse_id" uuid NOT NULL,
	"prescription_id" uuid NOT NULL,
	"sale_id" uuid,
	"dispensation_number" text NOT NULL,
	"dispensed_by" uuid,
	"checked_by" uuid,
	"status" "dispensation_status" DEFAULT 'PENDING' NOT NULL,
	"notes" text,
	"dispensed_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "dispensation_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"dispensation_id" uuid NOT NULL,
	"prescription_item_id" uuid NOT NULL,
	"sale_item_id" uuid,
	"product_id" uuid NOT NULL,
	"product_batch_id" uuid NOT NULL,
	"quantity_dispensed" numeric(12, 2) NOT NULL,
	"unit_price" numeric(12, 2) NOT NULL,
	"discount_amount" numeric(12, 2) DEFAULT '0' NOT NULL,
	"total_amount" numeric(12, 2) NOT NULL,
	"tax_amount" numeric(12, 2) DEFAULT '0' NOT NULL,
	"directions_given" text,
	"pharmacist_notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "branches" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"business_id" uuid NOT NULL,
	"code" text NOT NULL,
	"name" text NOT NULL,
	"phone" text,
	"email" text,
	"county" text,
	"town" text,
	"address" text,
	"active" boolean DEFAULT true NOT NULL,
	"is_head_office" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "warehouses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"business_id" uuid NOT NULL,
	"branch_id" uuid NOT NULL,
	"code" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "units" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"business_id" uuid,
	"code" text NOT NULL,
	"name" text NOT NULL,
	"symbol" text,
	"description" text,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "currencies" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" text NOT NULL,
	"name" text NOT NULL,
	"symbol" text NOT NULL,
	"decimal_places" integer DEFAULT 2 NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"is_default" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "payment_methods" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"business_id" uuid,
	"code" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"default_cash_account_id" uuid,
	"requires_reference" boolean DEFAULT false NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"is_default" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "business_settings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"business_id" uuid NOT NULL,
	"default_branch_id" uuid,
	"default_warehouse_id" uuid,
	"default_currency_id" uuid,
	"default_payment_method_id" uuid,
	"default_tax_rate_id" uuid,
	"current_fiscal_year_id" uuid,
	"allow_negative_stock" boolean DEFAULT false NOT NULL,
	"auto_post_journals" boolean DEFAULT true NOT NULL,
	"track_inventory_by_batch" boolean DEFAULT true NOT NULL,
	"enable_expiry_tracking" boolean DEFAULT true NOT NULL,
	"allow_backdated_transactions" boolean DEFAULT false NOT NULL,
	"require_customer_on_sale" boolean DEFAULT false NOT NULL,
	"require_supplier_on_purchase" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "fiscal_years" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"business_id" uuid NOT NULL,
	"code" text NOT NULL,
	"name" text NOT NULL,
	"start_date" date NOT NULL,
	"end_date" date NOT NULL,
	"is_current" boolean DEFAULT false NOT NULL,
	"is_closed" boolean DEFAULT false NOT NULL,
	"allow_posting" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "numbering_sequences" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"business_id" uuid NOT NULL,
	"branch_id" uuid,
	"document_type" "document_type" NOT NULL,
	"prefix" text NOT NULL,
	"suffix" text,
	"next_number" integer DEFAULT 1 NOT NULL,
	"number_length" integer DEFAULT 6 NOT NULL,
	"separator" text DEFAULT '-' NOT NULL,
	"reset_period" text DEFAULT 'NEVER' NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
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
CREATE TABLE "insurance_providers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"business_id" uuid,
	"code" text NOT NULL,
	"name" text NOT NULL,
	"contact_person" text,
	"phone" text,
	"email" text,
	"address" text,
	"website" text,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "insurance_plans" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"provider_id" uuid NOT NULL,
	"code" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"annual_limit" numeric(12, 2),
	"visit_limit" numeric(12, 2),
	"effective_from" timestamp,
	"effective_to" timestamp,
	"copay_amount" numeric(12, 2) DEFAULT '0' NOT NULL,
	"requires_pre_authorization" boolean DEFAULT false NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "insurance_memberships" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"customer_id" uuid NOT NULL,
	"insurance_plan_id" uuid NOT NULL,
	"membership_number" text NOT NULL,
	"principal_member_name" text,
	"relationship_to_principal" text,
	"active" boolean DEFAULT true NOT NULL,
	"effective_from" timestamp,
	"effective_to" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "insurance_claims" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"business_id" uuid NOT NULL,
	"customer_id" uuid NOT NULL,
	"insurance_membership_id" uuid NOT NULL,
	"consultation_id" uuid,
	"dispensation_id" uuid,
	"claim_number" text NOT NULL,
	"insurer_reference" text,
	"total_amount" numeric(12, 2) NOT NULL,
	"approved_amount" numeric(12, 2) DEFAULT '0' NOT NULL,
	"patient_responsibility" numeric(12, 2) DEFAULT '0' NOT NULL,
	"status" "insurance_claim_status" DEFAULT 'DRAFT' NOT NULL,
	"submitted_at" timestamp,
	"processed_at" timestamp,
	"paid_at" timestamp,
	"rejection_reason" text,
	"service_date" timestamp,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "insurance_claim_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"claim_id" uuid NOT NULL,
	"line_number" integer NOT NULL,
	"product_id" uuid,
	"description" text NOT NULL,
	"quantity" numeric(12, 2) DEFAULT '1' NOT NULL,
	"unit_price" numeric(12, 2) NOT NULL,
	"covered" boolean DEFAULT true NOT NULL,
	"claimed_amount" numeric(12, 2) NOT NULL,
	"approved_amount" numeric(12, 2) DEFAULT '0' NOT NULL,
	"rejected_amount" numeric(12, 2) DEFAULT '0' NOT NULL,
	"rejection_reason" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "consultation_diagnoses" ADD CONSTRAINT "consultation_diagnoses_consultation_id_consultations_id_fk" FOREIGN KEY ("consultation_id") REFERENCES "public"."consultations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "consultation_diagnoses" ADD CONSTRAINT "consultation_diagnoses_diagnosis_id_diagnoses_id_fk" FOREIGN KEY ("diagnosis_id") REFERENCES "public"."diagnoses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "consultations" ADD CONSTRAINT "consultations_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "consultations" ADD CONSTRAINT "consultations_branch_id_branches_id_fk" FOREIGN KEY ("branch_id") REFERENCES "public"."branches"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "consultations" ADD CONSTRAINT "consultations_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "consultations" ADD CONSTRAINT "consultations_clinician_id_users_id_fk" FOREIGN KEY ("clinician_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "diagnoses" ADD CONSTRAINT "diagnoses_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "account_categories" ADD CONSTRAINT "account_categories_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "account_categories" ADD CONSTRAINT "account_categories_account_type_id_account_types_id_fk" FOREIGN KEY ("account_type_id") REFERENCES "public"."account_types"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "account_types" ADD CONSTRAINT "account_types_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cash_accounts" ADD CONSTRAINT "cash_accounts_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cash_accounts" ADD CONSTRAINT "cash_accounts_account_id_chart_of_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."chart_of_accounts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chart_of_accounts" ADD CONSTRAINT "chart_of_accounts_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chart_of_accounts" ADD CONSTRAINT "chart_of_accounts_account_category_id_account_categories_id_fk" FOREIGN KEY ("account_category_id") REFERENCES "public"."account_categories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chart_of_accounts" ADD CONSTRAINT "coa_parent_account_fk" FOREIGN KEY ("parent_account_id") REFERENCES "public"."chart_of_accounts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "expense_categories" ADD CONSTRAINT "expense_categories_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "expenses" ADD CONSTRAINT "expenses_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "expenses" ADD CONSTRAINT "expenses_category_id_expense_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."expense_categories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "expenses" ADD CONSTRAINT "expenses_cash_account_id_cash_accounts_id_fk" FOREIGN KEY ("cash_account_id") REFERENCES "public"."cash_accounts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "expenses" ADD CONSTRAINT "expenses_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "income_categories" ADD CONSTRAINT "income_categories_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "incomes" ADD CONSTRAINT "incomes_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "incomes" ADD CONSTRAINT "incomes_category_id_income_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."income_categories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "incomes" ADD CONSTRAINT "incomes_cash_account_id_cash_accounts_id_fk" FOREIGN KEY ("cash_account_id") REFERENCES "public"."cash_accounts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "incomes" ADD CONSTRAINT "incomes_received_by_users_id_fk" FOREIGN KEY ("received_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "journal_entries" ADD CONSTRAINT "journal_entries_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "journal_entries" ADD CONSTRAINT "journal_entries_posted_by_users_id_fk" FOREIGN KEY ("posted_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "journal_entry_lines" ADD CONSTRAINT "journal_entry_lines_journal_entry_id_journal_entries_id_fk" FOREIGN KEY ("journal_entry_id") REFERENCES "public"."journal_entries"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "journal_entry_lines" ADD CONSTRAINT "journal_entry_lines_account_id_chart_of_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."chart_of_accounts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tax_rates" ADD CONSTRAINT "tax_rates_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_role_id_roles_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."roles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "roles" ADD CONSTRAINT "roles_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_role_id_roles_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."roles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_permission_id_permissions_id_fk" FOREIGN KEY ("permission_id") REFERENCES "public"."permissions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "categories" ADD CONSTRAINT "categories_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_supplier_id_suppliers_id_fk" FOREIGN KEY ("supplier_id") REFERENCES "public"."suppliers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_manufacturer_id_manufacturers_id_fk" FOREIGN KEY ("manufacturer_id") REFERENCES "public"."manufacturers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_drug_category_id_drug_categories_id_fk" FOREIGN KEY ("drug_category_id") REFERENCES "public"."drug_categories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_dosage_form_id_dosage_forms_id_fk" FOREIGN KEY ("dosage_form_id") REFERENCES "public"."dosage_forms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_drug_strength_id_drug_strengths_id_fk" FOREIGN KEY ("drug_strength_id") REFERENCES "public"."drug_strengths"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_prescription_type_id_prescription_types_id_fk" FOREIGN KEY ("prescription_type_id") REFERENCES "public"."prescription_types"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_purchase_unit_id_units_id_fk" FOREIGN KEY ("purchase_unit_id") REFERENCES "public"."units"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_sales_unit_id_units_id_fk" FOREIGN KEY ("sales_unit_id") REFERENCES "public"."units"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_stock_unit_id_units_id_fk" FOREIGN KEY ("stock_unit_id") REFERENCES "public"."units"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_income_account_id_chart_of_accounts_id_fk" FOREIGN KEY ("income_account_id") REFERENCES "public"."chart_of_accounts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_expense_account_id_chart_of_accounts_id_fk" FOREIGN KEY ("expense_account_id") REFERENCES "public"."chart_of_accounts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_inventory_account_id_chart_of_accounts_id_fk" FOREIGN KEY ("inventory_account_id") REFERENCES "public"."chart_of_accounts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_tax_rate_id_tax_rates_id_fk" FOREIGN KEY ("tax_rate_id") REFERENCES "public"."tax_rates"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_batches" ADD CONSTRAINT "product_batches_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_batches" ADD CONSTRAINT "product_batches_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_batches" ADD CONSTRAINT "product_batches_supplier_id_suppliers_id_fk" FOREIGN KEY ("supplier_id") REFERENCES "public"."suppliers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_prices" ADD CONSTRAINT "product_prices_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_prices" ADD CONSTRAINT "product_prices_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_prices" ADD CONSTRAINT "product_prices_price_list_id_price_lists_id_fk" FOREIGN KEY ("price_list_id") REFERENCES "public"."price_lists"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "price_lists" ADD CONSTRAINT "price_lists_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stock_movements" ADD CONSTRAINT "stock_movements_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stock_movements" ADD CONSTRAINT "stock_movements_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stock_movements" ADD CONSTRAINT "stock_movements_batch_id_product_batches_id_fk" FOREIGN KEY ("batch_id") REFERENCES "public"."product_batches"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stock_movements" ADD CONSTRAINT "stock_movements_warehouse_id_warehouses_id_fk" FOREIGN KEY ("warehouse_id") REFERENCES "public"."warehouses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stock_movements" ADD CONSTRAINT "stock_movements_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "suppliers" ADD CONSTRAINT "suppliers_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "purchase_orders" ADD CONSTRAINT "purchase_orders_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "purchase_orders" ADD CONSTRAINT "purchase_orders_supplier_id_suppliers_id_fk" FOREIGN KEY ("supplier_id") REFERENCES "public"."suppliers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "purchase_orders" ADD CONSTRAINT "purchase_orders_ordered_by_users_id_fk" FOREIGN KEY ("ordered_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "purchase_orders" ADD CONSTRAINT "purchase_orders_approved_by_users_id_fk" FOREIGN KEY ("approved_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "purchase_order_items" ADD CONSTRAINT "purchase_order_items_purchase_order_id_purchase_orders_id_fk" FOREIGN KEY ("purchase_order_id") REFERENCES "public"."purchase_orders"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "purchase_order_items" ADD CONSTRAINT "purchase_order_items_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
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
ALTER TABLE "customers" ADD CONSTRAINT "customers_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sales" ADD CONSTRAINT "sales_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sales" ADD CONSTRAINT "sales_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sales" ADD CONSTRAINT "sales_sold_by_users_id_fk" FOREIGN KEY ("sold_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sale_items" ADD CONSTRAINT "sale_items_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sale_items" ADD CONSTRAINT "sale_items_sale_id_sales_id_fk" FOREIGN KEY ("sale_id") REFERENCES "public"."sales"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sale_items" ADD CONSTRAINT "sale_items_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sale_item_batches" ADD CONSTRAINT "sale_item_batches_sale_item_id_sale_items_id_fk" FOREIGN KEY ("sale_item_id") REFERENCES "public"."sale_items"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sale_item_batches" ADD CONSTRAINT "sale_item_batches_product_batch_id_product_batches_id_fk" FOREIGN KEY ("product_batch_id") REFERENCES "public"."product_batches"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_sale_id_sales_id_fk" FOREIGN KEY ("sale_id") REFERENCES "public"."sales"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_cash_account_id_cash_accounts_id_fk" FOREIGN KEY ("cash_account_id") REFERENCES "public"."cash_accounts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_received_by_users_id_fk" FOREIGN KEY ("received_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sale_returns" ADD CONSTRAINT "sale_returns_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sale_returns" ADD CONSTRAINT "sale_returns_sale_id_sales_id_fk" FOREIGN KEY ("sale_id") REFERENCES "public"."sales"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sale_returns" ADD CONSTRAINT "sale_returns_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sale_returns" ADD CONSTRAINT "sale_returns_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sale_returns" ADD CONSTRAINT "sale_returns_approved_by_users_id_fk" FOREIGN KEY ("approved_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sale_return_items" ADD CONSTRAINT "sale_return_items_sale_return_id_sale_returns_id_fk" FOREIGN KEY ("sale_return_id") REFERENCES "public"."sale_returns"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sale_return_items" ADD CONSTRAINT "sale_return_items_sale_item_id_sale_items_id_fk" FOREIGN KEY ("sale_item_id") REFERENCES "public"."sale_items"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sale_return_items" ADD CONSTRAINT "sale_return_items_product_batch_id_product_batches_id_fk" FOREIGN KEY ("product_batch_id") REFERENCES "public"."product_batches"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "drug_categories" ADD CONSTRAINT "drug_categories_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "drug_strengths" ADD CONSTRAINT "drug_strengths_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dosage_forms" ADD CONSTRAINT "dosage_forms_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "manufacturers" ADD CONSTRAINT "manufacturers_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "prescription_types" ADD CONSTRAINT "prescription_types_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "prescriptions" ADD CONSTRAINT "prescriptions_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "prescriptions" ADD CONSTRAINT "prescriptions_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "prescriptions" ADD CONSTRAINT "prescriptions_consultation_id_consultations_id_fk" FOREIGN KEY ("consultation_id") REFERENCES "public"."consultations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "prescription_items" ADD CONSTRAINT "prescription_items_prescription_id_prescriptions_id_fk" FOREIGN KEY ("prescription_id") REFERENCES "public"."prescriptions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "prescription_items" ADD CONSTRAINT "prescription_items_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dispensations" ADD CONSTRAINT "dispensations_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dispensations" ADD CONSTRAINT "dispensations_branch_id_branches_id_fk" FOREIGN KEY ("branch_id") REFERENCES "public"."branches"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dispensations" ADD CONSTRAINT "dispensations_warehouse_id_warehouses_id_fk" FOREIGN KEY ("warehouse_id") REFERENCES "public"."warehouses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dispensations" ADD CONSTRAINT "dispensations_prescription_id_prescriptions_id_fk" FOREIGN KEY ("prescription_id") REFERENCES "public"."prescriptions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dispensations" ADD CONSTRAINT "dispensations_sale_id_sales_id_fk" FOREIGN KEY ("sale_id") REFERENCES "public"."sales"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dispensations" ADD CONSTRAINT "dispensations_dispensed_by_users_id_fk" FOREIGN KEY ("dispensed_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dispensations" ADD CONSTRAINT "dispensations_checked_by_users_id_fk" FOREIGN KEY ("checked_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dispensation_items" ADD CONSTRAINT "dispensation_items_dispensation_id_dispensations_id_fk" FOREIGN KEY ("dispensation_id") REFERENCES "public"."dispensations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dispensation_items" ADD CONSTRAINT "dispensation_items_prescription_item_id_prescription_items_id_fk" FOREIGN KEY ("prescription_item_id") REFERENCES "public"."prescription_items"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dispensation_items" ADD CONSTRAINT "dispensation_items_sale_item_id_sale_items_id_fk" FOREIGN KEY ("sale_item_id") REFERENCES "public"."sale_items"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dispensation_items" ADD CONSTRAINT "dispensation_items_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dispensation_items" ADD CONSTRAINT "dispensation_items_product_batch_id_product_batches_id_fk" FOREIGN KEY ("product_batch_id") REFERENCES "public"."product_batches"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "branches" ADD CONSTRAINT "branches_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "warehouses" ADD CONSTRAINT "warehouses_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "warehouses" ADD CONSTRAINT "warehouses_branch_id_branches_id_fk" FOREIGN KEY ("branch_id") REFERENCES "public"."branches"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "units" ADD CONSTRAINT "units_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payment_methods" ADD CONSTRAINT "payment_methods_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payment_methods" ADD CONSTRAINT "payment_methods_default_cash_account_id_cash_accounts_id_fk" FOREIGN KEY ("default_cash_account_id") REFERENCES "public"."cash_accounts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "business_settings" ADD CONSTRAINT "business_settings_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "business_settings" ADD CONSTRAINT "business_settings_default_branch_id_branches_id_fk" FOREIGN KEY ("default_branch_id") REFERENCES "public"."branches"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "business_settings" ADD CONSTRAINT "business_settings_default_warehouse_id_warehouses_id_fk" FOREIGN KEY ("default_warehouse_id") REFERENCES "public"."warehouses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "business_settings" ADD CONSTRAINT "business_settings_default_currency_id_currencies_id_fk" FOREIGN KEY ("default_currency_id") REFERENCES "public"."currencies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "business_settings" ADD CONSTRAINT "business_settings_default_payment_method_id_payment_methods_id_fk" FOREIGN KEY ("default_payment_method_id") REFERENCES "public"."payment_methods"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "business_settings" ADD CONSTRAINT "business_settings_default_tax_rate_id_tax_rates_id_fk" FOREIGN KEY ("default_tax_rate_id") REFERENCES "public"."tax_rates"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "business_settings" ADD CONSTRAINT "business_settings_current_fiscal_year_id_fiscal_years_id_fk" FOREIGN KEY ("current_fiscal_year_id") REFERENCES "public"."fiscal_years"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fiscal_years" ADD CONSTRAINT "fiscal_years_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "numbering_sequences" ADD CONSTRAINT "numbering_sequences_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "numbering_sequences" ADD CONSTRAINT "numbering_sequences_branch_id_branches_id_fk" FOREIGN KEY ("branch_id") REFERENCES "public"."branches"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "activity_logs" ADD CONSTRAINT "activity_logs_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "activity_logs" ADD CONSTRAINT "activity_logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "login_history" ADD CONSTRAINT "login_history_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "login_history" ADD CONSTRAINT "login_history_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "api_keys" ADD CONSTRAINT "api_keys_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "insurance_providers" ADD CONSTRAINT "insurance_providers_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "insurance_plans" ADD CONSTRAINT "insurance_plans_provider_id_insurance_providers_id_fk" FOREIGN KEY ("provider_id") REFERENCES "public"."insurance_providers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "insurance_memberships" ADD CONSTRAINT "insurance_memberships_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "insurance_memberships" ADD CONSTRAINT "insurance_memberships_insurance_plan_id_insurance_plans_id_fk" FOREIGN KEY ("insurance_plan_id") REFERENCES "public"."insurance_plans"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "insurance_claims" ADD CONSTRAINT "insurance_claims_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "insurance_claims" ADD CONSTRAINT "insurance_claims_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "insurance_claims" ADD CONSTRAINT "insurance_claims_insurance_membership_id_insurance_memberships_id_fk" FOREIGN KEY ("insurance_membership_id") REFERENCES "public"."insurance_memberships"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "insurance_claims" ADD CONSTRAINT "insurance_claims_consultation_id_consultations_id_fk" FOREIGN KEY ("consultation_id") REFERENCES "public"."consultations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "insurance_claims" ADD CONSTRAINT "insurance_claims_dispensation_id_dispensations_id_fk" FOREIGN KEY ("dispensation_id") REFERENCES "public"."dispensations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "insurance_claim_items" ADD CONSTRAINT "insurance_claim_items_claim_id_insurance_claims_id_fk" FOREIGN KEY ("claim_id") REFERENCES "public"."insurance_claims"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "insurance_claim_items" ADD CONSTRAINT "insurance_claim_items_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "consultation_diagnoses_consultation_idx" ON "consultation_diagnoses" USING btree ("consultation_id");--> statement-breakpoint
CREATE INDEX "consultation_diagnoses_diagnosis_idx" ON "consultation_diagnoses" USING btree ("diagnosis_id");--> statement-breakpoint
CREATE UNIQUE INDEX "consultation_diagnoses_unique" ON "consultation_diagnoses" USING btree ("consultation_id","diagnosis_id");--> statement-breakpoint
CREATE INDEX "consultations_business_idx" ON "consultations" USING btree ("business_id");--> statement-breakpoint
CREATE INDEX "consultations_branch_idx" ON "consultations" USING btree ("branch_id");--> statement-breakpoint
CREATE INDEX "consultations_customer_idx" ON "consultations" USING btree ("customer_id");--> statement-breakpoint
CREATE INDEX "consultations_clinician_idx" ON "consultations" USING btree ("clinician_id");--> statement-breakpoint
CREATE INDEX "consultations_status_idx" ON "consultations" USING btree ("status");--> statement-breakpoint
CREATE UNIQUE INDEX "consultations_business_number_unique" ON "consultations" USING btree ("business_id","consultation_number");--> statement-breakpoint
CREATE INDEX "diagnoses_business_idx" ON "diagnoses" USING btree ("business_id");--> statement-breakpoint
CREATE INDEX "diagnoses_active_idx" ON "diagnoses" USING btree ("active");--> statement-breakpoint
CREATE UNIQUE INDEX "diagnoses_business_code_unique" ON "diagnoses" USING btree ("business_id","code");--> statement-breakpoint
CREATE UNIQUE INDEX "diagnoses_business_name_unique" ON "diagnoses" USING btree ("business_id","name");--> statement-breakpoint
CREATE INDEX "businesses_type_idx" ON "businesses" USING btree ("business_type");--> statement-breakpoint
CREATE INDEX "businesses_active_idx" ON "businesses" USING btree ("active");--> statement-breakpoint
CREATE UNIQUE INDEX "businesses_registration_number_unique" ON "businesses" USING btree ("registration_number");--> statement-breakpoint
CREATE UNIQUE INDEX "businesses_kra_pin_unique" ON "businesses" USING btree ("kra_pin");--> statement-breakpoint
CREATE INDEX "account_categories_business_idx" ON "account_categories" USING btree ("business_id");--> statement-breakpoint
CREATE INDEX "account_categories_type_idx" ON "account_categories" USING btree ("account_type_id");--> statement-breakpoint
CREATE INDEX "account_categories_active_idx" ON "account_categories" USING btree ("active");--> statement-breakpoint
CREATE INDEX "account_categories_display_order_idx" ON "account_categories" USING btree ("display_order");--> statement-breakpoint
CREATE UNIQUE INDEX "account_categories_business_code_unique" ON "account_categories" USING btree ("business_id","code");--> statement-breakpoint
CREATE INDEX "account_types_business_idx" ON "account_types" USING btree ("business_id");--> statement-breakpoint
CREATE INDEX "account_types_active_idx" ON "account_types" USING btree ("active");--> statement-breakpoint
CREATE INDEX "account_types_display_order_idx" ON "account_types" USING btree ("display_order");--> statement-breakpoint
CREATE UNIQUE INDEX "account_types_business_code_unique" ON "account_types" USING btree ("business_id","code");--> statement-breakpoint
CREATE INDEX "cash_accounts_business_idx" ON "cash_accounts" USING btree ("business_id");--> statement-breakpoint
CREATE INDEX "cash_accounts_account_idx" ON "cash_accounts" USING btree ("account_id");--> statement-breakpoint
CREATE INDEX "cash_accounts_type_idx" ON "cash_accounts" USING btree ("type");--> statement-breakpoint
CREATE INDEX "cash_accounts_active_idx" ON "cash_accounts" USING btree ("active");--> statement-breakpoint
CREATE UNIQUE INDEX "cash_accounts_business_name_unique" ON "cash_accounts" USING btree ("business_id","name");--> statement-breakpoint
CREATE INDEX "coa_business_idx" ON "chart_of_accounts" USING btree ("business_id");--> statement-breakpoint
CREATE INDEX "coa_account_category_idx" ON "chart_of_accounts" USING btree ("account_category_id");--> statement-breakpoint
CREATE INDEX "coa_parent_idx" ON "chart_of_accounts" USING btree ("parent_account_id");--> statement-breakpoint
CREATE INDEX "coa_active_idx" ON "chart_of_accounts" USING btree ("active");--> statement-breakpoint
CREATE INDEX "coa_display_order_idx" ON "chart_of_accounts" USING btree ("display_order");--> statement-breakpoint
CREATE UNIQUE INDEX "coa_business_account_code_unique" ON "chart_of_accounts" USING btree ("business_id","account_code");--> statement-breakpoint
CREATE INDEX "expense_categories_business_idx" ON "expense_categories" USING btree ("business_id");--> statement-breakpoint
CREATE INDEX "expense_categories_active_idx" ON "expense_categories" USING btree ("active");--> statement-breakpoint
CREATE UNIQUE INDEX "expense_categories_business_name_unique" ON "expense_categories" USING btree ("business_id","name");--> statement-breakpoint
CREATE INDEX "expenses_business_idx" ON "expenses" USING btree ("business_id");--> statement-breakpoint
CREATE INDEX "expenses_category_idx" ON "expenses" USING btree ("category_id");--> statement-breakpoint
CREATE INDEX "expenses_cash_account_idx" ON "expenses" USING btree ("cash_account_id");--> statement-breakpoint
CREATE INDEX "expenses_date_idx" ON "expenses" USING btree ("expense_date");--> statement-breakpoint
CREATE INDEX "income_categories_business_idx" ON "income_categories" USING btree ("business_id");--> statement-breakpoint
CREATE INDEX "income_categories_active_idx" ON "income_categories" USING btree ("active");--> statement-breakpoint
CREATE UNIQUE INDEX "income_categories_business_name_unique" ON "income_categories" USING btree ("business_id","name");--> statement-breakpoint
CREATE INDEX "incomes_business_idx" ON "incomes" USING btree ("business_id");--> statement-breakpoint
CREATE INDEX "incomes_category_idx" ON "incomes" USING btree ("category_id");--> statement-breakpoint
CREATE INDEX "incomes_cash_account_idx" ON "incomes" USING btree ("cash_account_id");--> statement-breakpoint
CREATE INDEX "incomes_date_idx" ON "incomes" USING btree ("income_date");--> statement-breakpoint
CREATE INDEX "incomes_status_idx" ON "incomes" USING btree ("status");--> statement-breakpoint
CREATE INDEX "journal_entries_business_idx" ON "journal_entries" USING btree ("business_id");--> statement-breakpoint
CREATE INDEX "journal_entries_number_idx" ON "journal_entries" USING btree ("journal_number");--> statement-breakpoint
CREATE INDEX "journal_entries_date_idx" ON "journal_entries" USING btree ("transaction_date");--> statement-breakpoint
CREATE INDEX "journal_entries_status_idx" ON "journal_entries" USING btree ("status");--> statement-breakpoint
CREATE UNIQUE INDEX "journal_entry_lines_journal_line_unique" ON "journal_entry_lines" USING btree ("journal_entry_id","line_number");--> statement-breakpoint
CREATE INDEX "journal_entry_lines_journal_idx" ON "journal_entry_lines" USING btree ("journal_entry_id");--> statement-breakpoint
CREATE INDEX "journal_entry_lines_account_idx" ON "journal_entry_lines" USING btree ("account_id");--> statement-breakpoint
CREATE INDEX "tax_rates_business_idx" ON "tax_rates" USING btree ("business_id");--> statement-breakpoint
CREATE INDEX "tax_rates_active_idx" ON "tax_rates" USING btree ("active");--> statement-breakpoint
CREATE UNIQUE INDEX "tax_rates_business_code_unique" ON "tax_rates" USING btree ("business_id","code");--> statement-breakpoint
CREATE INDEX "users_business_idx" ON "users" USING btree ("business_id");--> statement-breakpoint
CREATE INDEX "users_role_idx" ON "users" USING btree ("role_id");--> statement-breakpoint
CREATE INDEX "users_active_idx" ON "users" USING btree ("active");--> statement-breakpoint
CREATE UNIQUE INDEX "users_business_email_unique" ON "users" USING btree ("business_id","email");--> statement-breakpoint
CREATE INDEX "roles_business_idx" ON "roles" USING btree ("business_id");--> statement-breakpoint
CREATE INDEX "roles_active_idx" ON "roles" USING btree ("active");--> statement-breakpoint
CREATE INDEX "roles_system_idx" ON "roles" USING btree ("is_system");--> statement-breakpoint
CREATE UNIQUE INDEX "roles_business_name_unique" ON "roles" USING btree ("business_id","name");--> statement-breakpoint
CREATE UNIQUE INDEX "permissions_code_unique" ON "permissions" USING btree ("code");--> statement-breakpoint
CREATE UNIQUE INDEX "permissions_name_unique" ON "permissions" USING btree ("name");--> statement-breakpoint
CREATE INDEX "permissions_module_idx" ON "permissions" USING btree ("module");--> statement-breakpoint
CREATE INDEX "role_permissions_permission_idx" ON "role_permissions" USING btree ("permission_id");--> statement-breakpoint
CREATE INDEX "categories_business_idx" ON "categories" USING btree ("business_id");--> statement-breakpoint
CREATE INDEX "categories_name_idx" ON "categories" USING btree ("name");--> statement-breakpoint
CREATE UNIQUE INDEX "categories_business_name_unique" ON "categories" USING btree ("business_id","name");--> statement-breakpoint
CREATE INDEX "products_business_idx" ON "products" USING btree ("business_id");--> statement-breakpoint
CREATE INDEX "products_category_idx" ON "products" USING btree ("category_id");--> statement-breakpoint
CREATE INDEX "products_supplier_idx" ON "products" USING btree ("supplier_id");--> statement-breakpoint
CREATE INDEX "products_manufacturer_idx" ON "products" USING btree ("manufacturer_id");--> statement-breakpoint
CREATE INDEX "products_drug_category_idx" ON "products" USING btree ("drug_category_id");--> statement-breakpoint
CREATE UNIQUE INDEX "products_business_barcode_unique" ON "products" USING btree ("business_id","barcode");--> statement-breakpoint
CREATE UNIQUE INDEX "products_business_sku_unique" ON "products" USING btree ("business_id","sku");--> statement-breakpoint
CREATE INDEX "products_business_name_idx" ON "products" USING btree ("business_id","name");--> statement-breakpoint
CREATE INDEX "batch_business_idx" ON "product_batches" USING btree ("business_id");--> statement-breakpoint
CREATE INDEX "batch_product_idx" ON "product_batches" USING btree ("product_id");--> statement-breakpoint
CREATE INDEX "batch_supplier_idx" ON "product_batches" USING btree ("supplier_id");--> statement-breakpoint
CREATE INDEX "batch_expiry_idx" ON "product_batches" USING btree ("expiry_date");--> statement-breakpoint
CREATE UNIQUE INDEX "product_batch_unique" ON "product_batches" USING btree ("business_id","product_id","batch_number");--> statement-breakpoint
CREATE INDEX "product_prices_business_idx" ON "product_prices" USING btree ("business_id");--> statement-breakpoint
CREATE INDEX "product_prices_product_idx" ON "product_prices" USING btree ("product_id");--> statement-breakpoint
CREATE INDEX "product_prices_price_list_idx" ON "product_prices" USING btree ("price_list_id");--> statement-breakpoint
CREATE UNIQUE INDEX "product_prices_product_price_list_qty_unique" ON "product_prices" USING btree ("product_id","price_list_id","minimum_quantity");--> statement-breakpoint
CREATE INDEX "price_lists_business_idx" ON "price_lists" USING btree ("business_id");--> statement-breakpoint
CREATE INDEX "price_lists_active_idx" ON "price_lists" USING btree ("active");--> statement-breakpoint
CREATE UNIQUE INDEX "price_lists_business_code_unique" ON "price_lists" USING btree ("business_id","code");--> statement-breakpoint
CREATE UNIQUE INDEX "price_lists_business_name_unique" ON "price_lists" USING btree ("business_id","name");--> statement-breakpoint
CREATE INDEX "stock_business_idx" ON "stock_movements" USING btree ("business_id");--> statement-breakpoint
CREATE INDEX "stock_product_idx" ON "stock_movements" USING btree ("product_id");--> statement-breakpoint
CREATE INDEX "stock_batch_idx" ON "stock_movements" USING btree ("batch_id");--> statement-breakpoint
CREATE INDEX "stock_user_idx" ON "stock_movements" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "stock_type_idx" ON "stock_movements" USING btree ("movement_type");--> statement-breakpoint
CREATE INDEX "stock_created_idx" ON "stock_movements" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "suppliers_business_idx" ON "suppliers" USING btree ("business_id");--> statement-breakpoint
CREATE INDEX "suppliers_name_idx" ON "suppliers" USING btree ("name");--> statement-breakpoint
CREATE UNIQUE INDEX "suppliers_business_name_unique" ON "suppliers" USING btree ("business_id","name");--> statement-breakpoint
CREATE INDEX "po_business_idx" ON "purchase_orders" USING btree ("business_id");--> statement-breakpoint
CREATE INDEX "po_supplier_idx" ON "purchase_orders" USING btree ("supplier_id");--> statement-breakpoint
CREATE INDEX "po_order_idx" ON "purchase_orders" USING btree ("order_number");--> statement-breakpoint
CREATE INDEX "po_status_idx" ON "purchase_orders" USING btree ("status");--> statement-breakpoint
CREATE INDEX "poi_order_idx" ON "purchase_order_items" USING btree ("purchase_order_id");--> statement-breakpoint
CREATE INDEX "poi_product_idx" ON "purchase_order_items" USING btree ("product_id");--> statement-breakpoint
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
CREATE INDEX "customers_id_number_idx" ON "customers" USING btree ("id_number");--> statement-breakpoint
CREATE INDEX "customers_active_idx" ON "customers" USING btree ("active");--> statement-breakpoint
CREATE INDEX "customers_type_idx" ON "customers" USING btree ("customer_type");--> statement-breakpoint
CREATE UNIQUE INDEX "customers_business_customer_number_unique" ON "customers" USING btree ("business_id","customer_number");--> statement-breakpoint
CREATE INDEX "sales_business_idx" ON "sales" USING btree ("business_id");--> statement-breakpoint
CREATE INDEX "sales_customer_idx" ON "sales" USING btree ("customer_id");--> statement-breakpoint
CREATE UNIQUE INDEX "sales_business_invoice_unique" ON "sales" USING btree ("business_id","invoice_number");--> statement-breakpoint
CREATE INDEX "sales_sold_by_idx" ON "sales" USING btree ("sold_by");--> statement-breakpoint
CREATE INDEX "sales_status_idx" ON "sales" USING btree ("status");--> statement-breakpoint
CREATE INDEX "sales_sold_at_idx" ON "sales" USING btree ("sold_at");--> statement-breakpoint
CREATE INDEX "sales_created_at_idx" ON "sales" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "sale_items_business_idx" ON "sale_items" USING btree ("business_id");--> statement-breakpoint
CREATE INDEX "sale_items_sale_idx" ON "sale_items" USING btree ("sale_id");--> statement-breakpoint
CREATE INDEX "sale_items_product_idx" ON "sale_items" USING btree ("product_id");--> statement-breakpoint
CREATE INDEX "sale_item_batches_sale_item_idx" ON "sale_item_batches" USING btree ("sale_item_id");--> statement-breakpoint
CREATE INDEX "sale_item_batches_batch_idx" ON "sale_item_batches" USING btree ("product_batch_id");--> statement-breakpoint
CREATE UNIQUE INDEX "sale_item_batch_unique" ON "sale_item_batches" USING btree ("sale_item_id","product_batch_id");--> statement-breakpoint
CREATE INDEX "payments_business_idx" ON "payments" USING btree ("business_id");--> statement-breakpoint
CREATE INDEX "payments_sale_idx" ON "payments" USING btree ("sale_id");--> statement-breakpoint
CREATE INDEX "payments_method_idx" ON "payments" USING btree ("method");--> statement-breakpoint
CREATE INDEX "payments_status_idx" ON "payments" USING btree ("status");--> statement-breakpoint
CREATE INDEX "payments_reference_idx" ON "payments" USING btree ("reference");--> statement-breakpoint
CREATE INDEX "payments_received_by_idx" ON "payments" USING btree ("received_by");--> statement-breakpoint
CREATE INDEX "payments_paid_at_idx" ON "payments" USING btree ("paid_at");--> statement-breakpoint
CREATE INDEX "sale_returns_business_idx" ON "sale_returns" USING btree ("business_id");--> statement-breakpoint
CREATE INDEX "sale_returns_sale_idx" ON "sale_returns" USING btree ("sale_id");--> statement-breakpoint
CREATE INDEX "sale_returns_customer_idx" ON "sale_returns" USING btree ("customer_id");--> statement-breakpoint
CREATE INDEX "sale_returns_reason_idx" ON "sale_returns" USING btree ("reason");--> statement-breakpoint
CREATE INDEX "sale_returns_created_at_idx" ON "sale_returns" USING btree ("created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "sale_returns_business_return_unique" ON "sale_returns" USING btree ("business_id","return_number");--> statement-breakpoint
CREATE INDEX "sale_return_items_return_idx" ON "sale_return_items" USING btree ("sale_return_id");--> statement-breakpoint
CREATE INDEX "sale_return_items_sale_item_idx" ON "sale_return_items" USING btree ("sale_item_id");--> statement-breakpoint
CREATE INDEX "sale_return_items_batch_idx" ON "sale_return_items" USING btree ("product_batch_id");--> statement-breakpoint
CREATE UNIQUE INDEX "sale_return_item_batch_unique" ON "sale_return_items" USING btree ("sale_return_id","sale_item_id","product_batch_id");--> statement-breakpoint
CREATE INDEX "drug_categories_business_idx" ON "drug_categories" USING btree ("business_id");--> statement-breakpoint
CREATE INDEX "drug_categories_active_idx" ON "drug_categories" USING btree ("active");--> statement-breakpoint
CREATE UNIQUE INDEX "drug_categories_business_code_unique" ON "drug_categories" USING btree ("business_id","code");--> statement-breakpoint
CREATE UNIQUE INDEX "drug_categories_business_name_unique" ON "drug_categories" USING btree ("business_id","name");--> statement-breakpoint
CREATE INDEX "drug_strengths_business_idx" ON "drug_strengths" USING btree ("business_id");--> statement-breakpoint
CREATE INDEX "drug_strengths_active_idx" ON "drug_strengths" USING btree ("active");--> statement-breakpoint
CREATE UNIQUE INDEX "drug_strengths_business_code_unique" ON "drug_strengths" USING btree ("business_id","code");--> statement-breakpoint
CREATE UNIQUE INDEX "drug_strengths_business_name_unique" ON "drug_strengths" USING btree ("business_id","name");--> statement-breakpoint
CREATE INDEX "dosage_forms_business_idx" ON "dosage_forms" USING btree ("business_id");--> statement-breakpoint
CREATE INDEX "dosage_forms_active_idx" ON "dosage_forms" USING btree ("active");--> statement-breakpoint
CREATE UNIQUE INDEX "dosage_forms_business_code_unique" ON "dosage_forms" USING btree ("business_id","code");--> statement-breakpoint
CREATE UNIQUE INDEX "dosage_forms_business_name_unique" ON "dosage_forms" USING btree ("business_id","name");--> statement-breakpoint
CREATE INDEX "manufacturers_business_idx" ON "manufacturers" USING btree ("business_id");--> statement-breakpoint
CREATE INDEX "manufacturers_active_idx" ON "manufacturers" USING btree ("active");--> statement-breakpoint
CREATE UNIQUE INDEX "manufacturers_business_name_unique" ON "manufacturers" USING btree ("business_id","name");--> statement-breakpoint
CREATE INDEX "prescription_types_business_idx" ON "prescription_types" USING btree ("business_id");--> statement-breakpoint
CREATE INDEX "prescription_types_active_idx" ON "prescription_types" USING btree ("active");--> statement-breakpoint
CREATE UNIQUE INDEX "prescription_types_business_code_unique" ON "prescription_types" USING btree ("business_id","code");--> statement-breakpoint
CREATE UNIQUE INDEX "prescription_types_business_name_unique" ON "prescription_types" USING btree ("business_id","name");--> statement-breakpoint
CREATE INDEX "prescriptions_business_idx" ON "prescriptions" USING btree ("business_id");--> statement-breakpoint
CREATE INDEX "prescriptions_customer_idx" ON "prescriptions" USING btree ("customer_id");--> statement-breakpoint
CREATE INDEX "prescriptions_status_idx" ON "prescriptions" USING btree ("status");--> statement-breakpoint
CREATE UNIQUE INDEX "prescriptions_business_number_unique" ON "prescriptions" USING btree ("business_id","prescription_number");--> statement-breakpoint
CREATE INDEX "prescription_items_prescription_idx" ON "prescription_items" USING btree ("prescription_id");--> statement-breakpoint
CREATE INDEX "prescription_items_product_idx" ON "prescription_items" USING btree ("product_id");--> statement-breakpoint
CREATE INDEX "dispensations_business_idx" ON "dispensations" USING btree ("business_id");--> statement-breakpoint
CREATE INDEX "dispensations_branch_idx" ON "dispensations" USING btree ("branch_id");--> statement-breakpoint
CREATE INDEX "dispensations_warehouse_idx" ON "dispensations" USING btree ("warehouse_id");--> statement-breakpoint
CREATE INDEX "dispensations_prescription_idx" ON "dispensations" USING btree ("prescription_id");--> statement-breakpoint
CREATE INDEX "dispensations_sale_idx" ON "dispensations" USING btree ("sale_id");--> statement-breakpoint
CREATE INDEX "dispensations_status_idx" ON "dispensations" USING btree ("status");--> statement-breakpoint
CREATE UNIQUE INDEX "dispensations_business_number_unique" ON "dispensations" USING btree ("business_id","dispensation_number");--> statement-breakpoint
CREATE INDEX "dispensation_items_dispensation_idx" ON "dispensation_items" USING btree ("dispensation_id");--> statement-breakpoint
CREATE INDEX "dispensation_items_prescription_item_idx" ON "dispensation_items" USING btree ("prescription_item_id");--> statement-breakpoint
CREATE INDEX "dispensation_items_sale_item_idx" ON "dispensation_items" USING btree ("sale_item_id");--> statement-breakpoint
CREATE INDEX "dispensation_items_product_idx" ON "dispensation_items" USING btree ("product_id");--> statement-breakpoint
CREATE INDEX "dispensation_items_batch_idx" ON "dispensation_items" USING btree ("product_batch_id");--> statement-breakpoint
CREATE INDEX "branches_business_idx" ON "branches" USING btree ("business_id");--> statement-breakpoint
CREATE INDEX "branches_active_idx" ON "branches" USING btree ("active");--> statement-breakpoint
CREATE INDEX "branches_head_office_idx" ON "branches" USING btree ("is_head_office");--> statement-breakpoint
CREATE UNIQUE INDEX "branches_business_code_unique" ON "branches" USING btree ("business_id","code");--> statement-breakpoint
CREATE UNIQUE INDEX "branches_business_name_unique" ON "branches" USING btree ("business_id","name");--> statement-breakpoint
CREATE INDEX "warehouses_business_idx" ON "warehouses" USING btree ("business_id");--> statement-breakpoint
CREATE INDEX "warehouses_branch_idx" ON "warehouses" USING btree ("branch_id");--> statement-breakpoint
CREATE INDEX "warehouses_active_idx" ON "warehouses" USING btree ("active");--> statement-breakpoint
CREATE UNIQUE INDEX "warehouses_branch_code_unique" ON "warehouses" USING btree ("branch_id","code");--> statement-breakpoint
CREATE UNIQUE INDEX "warehouses_branch_name_unique" ON "warehouses" USING btree ("branch_id","name");--> statement-breakpoint
CREATE INDEX "units_business_idx" ON "units" USING btree ("business_id");--> statement-breakpoint
CREATE INDEX "units_active_idx" ON "units" USING btree ("active");--> statement-breakpoint
CREATE UNIQUE INDEX "units_business_code_unique" ON "units" USING btree ("business_id","code");--> statement-breakpoint
CREATE UNIQUE INDEX "units_business_name_unique" ON "units" USING btree ("business_id","name");--> statement-breakpoint
CREATE UNIQUE INDEX "units_business_symbol_unique" ON "units" USING btree ("business_id","symbol");--> statement-breakpoint
CREATE UNIQUE INDEX "currencies_code_unique" ON "currencies" USING btree ("code");--> statement-breakpoint
CREATE UNIQUE INDEX "currencies_name_unique" ON "currencies" USING btree ("name");--> statement-breakpoint
CREATE INDEX "currencies_active_idx" ON "currencies" USING btree ("active");--> statement-breakpoint
CREATE INDEX "currencies_default_idx" ON "currencies" USING btree ("is_default");--> statement-breakpoint
CREATE INDEX "payment_methods_business_idx" ON "payment_methods" USING btree ("business_id");--> statement-breakpoint
CREATE INDEX "payment_methods_active_idx" ON "payment_methods" USING btree ("active");--> statement-breakpoint
CREATE INDEX "payment_methods_default_idx" ON "payment_methods" USING btree ("is_default");--> statement-breakpoint
CREATE INDEX "payment_methods_requires_reference_idx" ON "payment_methods" USING btree ("requires_reference");--> statement-breakpoint
CREATE UNIQUE INDEX "payment_methods_business_code_unique" ON "payment_methods" USING btree ("business_id","code");--> statement-breakpoint
CREATE UNIQUE INDEX "payment_methods_business_name_unique" ON "payment_methods" USING btree ("business_id","name");--> statement-breakpoint
CREATE UNIQUE INDEX "business_settings_business_unique" ON "business_settings" USING btree ("business_id");--> statement-breakpoint
CREATE INDEX "fiscal_years_business_idx" ON "fiscal_years" USING btree ("business_id");--> statement-breakpoint
CREATE INDEX "fiscal_years_current_idx" ON "fiscal_years" USING btree ("is_current");--> statement-breakpoint
CREATE INDEX "fiscal_years_closed_idx" ON "fiscal_years" USING btree ("is_closed");--> statement-breakpoint
CREATE INDEX "fiscal_years_allow_posting_idx" ON "fiscal_years" USING btree ("allow_posting");--> statement-breakpoint
CREATE UNIQUE INDEX "fiscal_years_business_code_unique" ON "fiscal_years" USING btree ("business_id","code");--> statement-breakpoint
CREATE UNIQUE INDEX "fiscal_years_business_name_unique" ON "fiscal_years" USING btree ("business_id","name");--> statement-breakpoint
CREATE INDEX "numbering_sequences_business_idx" ON "numbering_sequences" USING btree ("business_id");--> statement-breakpoint
CREATE INDEX "numbering_sequences_branch_idx" ON "numbering_sequences" USING btree ("branch_id");--> statement-breakpoint
CREATE INDEX "numbering_sequences_document_type_idx" ON "numbering_sequences" USING btree ("document_type");--> statement-breakpoint
CREATE INDEX "numbering_sequences_active_idx" ON "numbering_sequences" USING btree ("active");--> statement-breakpoint
CREATE UNIQUE INDEX "numbering_sequences_business_branch_document_unique" ON "numbering_sequences" USING btree ("business_id","branch_id","document_type");--> statement-breakpoint
CREATE INDEX "activity_logs_business_idx" ON "activity_logs" USING btree ("business_id");--> statement-breakpoint
CREATE INDEX "activity_logs_user_idx" ON "activity_logs" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "activity_logs_entity_idx" ON "activity_logs" USING btree ("entity");--> statement-breakpoint
CREATE INDEX "activity_logs_created_idx" ON "activity_logs" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "login_history_business_idx" ON "login_history" USING btree ("business_id");--> statement-breakpoint
CREATE INDEX "login_history_user_idx" ON "login_history" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "api_keys_business_idx" ON "api_keys" USING btree ("business_id");--> statement-breakpoint
CREATE INDEX "api_keys_active_idx" ON "api_keys" USING btree ("active");--> statement-breakpoint
CREATE INDEX "insurance_providers_business_idx" ON "insurance_providers" USING btree ("business_id");--> statement-breakpoint
CREATE INDEX "insurance_providers_active_idx" ON "insurance_providers" USING btree ("active");--> statement-breakpoint
CREATE UNIQUE INDEX "insurance_providers_business_code_unique" ON "insurance_providers" USING btree ("business_id","code");--> statement-breakpoint
CREATE UNIQUE INDEX "insurance_providers_business_name_unique" ON "insurance_providers" USING btree ("business_id","name");--> statement-breakpoint
CREATE INDEX "insurance_plans_provider_idx" ON "insurance_plans" USING btree ("provider_id");--> statement-breakpoint
CREATE INDEX "insurance_plans_active_idx" ON "insurance_plans" USING btree ("active");--> statement-breakpoint
CREATE UNIQUE INDEX "insurance_plans_provider_code_unique" ON "insurance_plans" USING btree ("provider_id","code");--> statement-breakpoint
CREATE UNIQUE INDEX "insurance_plans_provider_name_unique" ON "insurance_plans" USING btree ("provider_id","name");--> statement-breakpoint
CREATE INDEX "insurance_memberships_customer_idx" ON "insurance_memberships" USING btree ("customer_id");--> statement-breakpoint
CREATE INDEX "insurance_memberships_plan_idx" ON "insurance_memberships" USING btree ("insurance_plan_id");--> statement-breakpoint
CREATE INDEX "insurance_memberships_active_idx" ON "insurance_memberships" USING btree ("active");--> statement-breakpoint
CREATE UNIQUE INDEX "insurance_memberships_number_unique" ON "insurance_memberships" USING btree ("membership_number");--> statement-breakpoint
CREATE INDEX "insurance_claims_business_idx" ON "insurance_claims" USING btree ("business_id");--> statement-breakpoint
CREATE INDEX "insurance_claims_customer_idx" ON "insurance_claims" USING btree ("customer_id");--> statement-breakpoint
CREATE INDEX "insurance_claims_membership_idx" ON "insurance_claims" USING btree ("insurance_membership_id");--> statement-breakpoint
CREATE INDEX "insurance_claims_consultation_idx" ON "insurance_claims" USING btree ("consultation_id");--> statement-breakpoint
CREATE INDEX "insurance_claims_dispensation_idx" ON "insurance_claims" USING btree ("dispensation_id");--> statement-breakpoint
CREATE INDEX "insurance_claims_status_idx" ON "insurance_claims" USING btree ("status");--> statement-breakpoint
CREATE UNIQUE INDEX "insurance_claims_business_number_unique" ON "insurance_claims" USING btree ("business_id","claim_number");--> statement-breakpoint
CREATE INDEX "insurance_claim_items_claim_idx" ON "insurance_claim_items" USING btree ("claim_id");--> statement-breakpoint
CREATE INDEX "insurance_claim_items_product_idx" ON "insurance_claim_items" USING btree ("product_id");