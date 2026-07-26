ALTER TABLE "permissions" ADD COLUMN "active" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "permissions" ADD COLUMN "is_system" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "permissions" ADD COLUMN "created_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "permissions" ADD COLUMN "updated_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
CREATE INDEX "permissions_active_idx" ON "permissions" USING btree ("active");