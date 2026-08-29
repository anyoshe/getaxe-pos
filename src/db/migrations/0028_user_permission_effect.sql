-- Grant vs deny overrides on top of role permissions
ALTER TABLE "user_permissions"
  ADD COLUMN IF NOT EXISTS "effect" text NOT NULL DEFAULT 'grant';

-- existing rows remain grants
UPDATE "user_permissions" SET "effect" = 'grant' WHERE "effect" IS NULL OR "effect" = '';
