CREATE TABLE "businesses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"legal_name" text,
	"registration_number" text,
	"kra_pin" text,
	"business_type" text NOT NULL,
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
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"business_id" uuid NOT NULL,
	"role_id" uuid NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"phone" text,
	"password_hash" text NOT NULL,
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
ALTER TABLE "users" ADD CONSTRAINT "users_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_role_id_roles_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."roles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "roles" ADD CONSTRAINT "roles_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_role_id_roles_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."roles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_permission_id_permissions_id_fk" FOREIGN KEY ("permission_id") REFERENCES "public"."permissions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "users_email_idx" ON "users" USING btree ("email");--> statement-breakpoint
CREATE INDEX "users_business_idx" ON "users" USING btree ("business_id");--> statement-breakpoint
CREATE INDEX "users_role_idx" ON "users" USING btree ("role_id");--> statement-breakpoint
CREATE UNIQUE INDEX "users_business_email_unique" ON "users" USING btree ("business_id","email");--> statement-breakpoint
CREATE INDEX "roles_business_idx" ON "roles" USING btree ("business_id");--> statement-breakpoint
CREATE INDEX "roles_name_idx" ON "roles" USING btree ("name");--> statement-breakpoint
CREATE UNIQUE INDEX "roles_business_name_unique" ON "roles" USING btree ("business_id","name");--> statement-breakpoint
CREATE UNIQUE INDEX "permissions_code_unique" ON "permissions" USING btree ("code");--> statement-breakpoint
CREATE INDEX "permissions_module_idx" ON "permissions" USING btree ("module");--> statement-breakpoint
CREATE INDEX "role_permissions_role_idx" ON "role_permissions" USING btree ("role_id");--> statement-breakpoint
CREATE INDEX "role_permissions_permission_idx" ON "role_permissions" USING btree ("permission_id");