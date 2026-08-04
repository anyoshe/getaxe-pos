ALTER TABLE "user_invitations" ADD COLUMN "password_hash" text;--> statement-breakpoint
ALTER TABLE "user_invitations" ADD COLUMN "status" text DEFAULT 'INVITED' NOT NULL;--> statement-breakpoint
ALTER TABLE "user_invitations" DROP COLUMN "accepted";