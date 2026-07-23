CREATE TYPE "public"."cash_account_type" AS ENUM('CASH', 'BANK', 'MPESA', 'MOBILE_MONEY', 'PETTY_CASH');--> statement-breakpoint
CREATE TABLE "cash_accounts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"business_id" uuid NOT NULL,
	"name" text NOT NULL,
	"type" "cash_account_type" NOT NULL,
	"account_number" text,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "payments" ADD COLUMN "cash_account_id" uuid;--> statement-breakpoint
ALTER TABLE "cash_accounts" ADD CONSTRAINT "cash_accounts_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "cash_accounts_business_idx" ON "cash_accounts" USING btree ("business_id");--> statement-breakpoint
CREATE INDEX "cash_accounts_type_idx" ON "cash_accounts" USING btree ("type");--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_cash_account_id_cash_accounts_id_fk" FOREIGN KEY ("cash_account_id") REFERENCES "public"."cash_accounts"("id") ON DELETE no action ON UPDATE no action;