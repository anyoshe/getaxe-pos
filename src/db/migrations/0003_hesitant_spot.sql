CREATE TABLE "countries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" text NOT NULL,
	"iso3" text NOT NULL,
	"name" text NOT NULL,
	"phone_code" text,
	"currency_code" text,
	"timezone" text,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX "countries_code_unique" ON "countries" USING btree ("code");--> statement-breakpoint
CREATE UNIQUE INDEX "countries_iso3_unique" ON "countries" USING btree ("iso3");--> statement-breakpoint
CREATE UNIQUE INDEX "countries_name_unique" ON "countries" USING btree ("name");--> statement-breakpoint
CREATE INDEX "countries_active_idx" ON "countries" USING btree ("active");