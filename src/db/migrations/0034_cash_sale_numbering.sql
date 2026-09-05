-- Separate document type for paid cash sales numbering
DO $$ BEGIN
  ALTER TYPE document_type ADD VALUE IF NOT EXISTS 'CASH_SALE';
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;
