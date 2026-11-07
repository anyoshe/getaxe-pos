-- Idempotent offline POS sync: client-generated id unique per business
ALTER TABLE sales
  ADD COLUMN IF NOT EXISTS client_sale_id text;

CREATE UNIQUE INDEX IF NOT EXISTS sales_business_client_sale_uidx
  ON sales (business_id, client_sale_id)
  WHERE client_sale_id IS NOT NULL;
