CREATE TABLE "business_capabilities" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"business_id" uuid NOT NULL,
	"capability_id" uuid NOT NULL,
	"enabled" boolean DEFAULT true NOT NULL,
	"source" text DEFAULT 'PROFILE' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "capabilities" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" text NOT NULL,
	"capability_id" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"module" text NOT NULL,
	"group" text NOT NULL,
	"category" text NOT NULL,
	"status" text NOT NULL,
	"default_enabled" boolean DEFAULT false NOT NULL,
	"industries" jsonb DEFAULT '[]'::jsonb,
	"dependencies" jsonb DEFAULT '[]'::jsonb,
	"conflicts" jsonb DEFAULT '[]'::jsonb,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "capabilities_code_unique" UNIQUE("code"),
	CONSTRAINT "capabilities_capability_id_unique" UNIQUE("capability_id")
);
--> statement-breakpoint
CREATE TABLE "capability_overrides" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"business_capability_id" uuid NOT NULL,
	"changed_by" uuid,
	"previous_value" boolean NOT NULL,
	"new_value" boolean NOT NULL,
	"reason" text,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "business_capabilities" ADD CONSTRAINT "business_capabilities_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "business_capabilities" ADD CONSTRAINT "business_capabilities_capability_id_capabilities_id_fk" FOREIGN KEY ("capability_id") REFERENCES "public"."capabilities"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "capability_overrides" ADD CONSTRAINT "capability_overrides_business_capability_id_business_capabilities_id_fk" FOREIGN KEY ("business_capability_id") REFERENCES "public"."business_capabilities"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "capability_overrides" ADD CONSTRAINT "capability_overrides_changed_by_users_id_fk" FOREIGN KEY ("changed_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "business_capabilities_business_idx" ON "business_capabilities" USING btree ("business_id");--> statement-breakpoint
CREATE INDEX "business_capabilities_capability_idx" ON "business_capabilities" USING btree ("capability_id");--> statement-breakpoint
CREATE INDEX "capabilities_code_idx" ON "capabilities" USING btree ("code");--> statement-breakpoint
CREATE INDEX "capabilities_capability_id_idx" ON "capabilities" USING btree ("capability_id");--> statement-breakpoint
CREATE INDEX "capability_override_capability_idx" ON "capability_overrides" USING btree ("business_capability_id");--> statement-breakpoint
CREATE INDEX "capability_override_changed_by_idx" ON "capability_overrides" USING btree ("changed_by");--> statement-breakpoint
DROP TYPE "public"."business_type";