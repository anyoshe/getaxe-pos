-- Per-business M-Pesa (Daraja) integration for POS STK Push
CREATE TABLE IF NOT EXISTS mpesa_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  enabled boolean NOT NULL DEFAULT false,
  environment text NOT NULL DEFAULT 'sandbox',
  consumer_key text,
  consumer_secret text,
  passkey text,
  shortcode text,
  shortcode_type text NOT NULL DEFAULT 'TILL',
  account_reference text DEFAULT 'GetAxe',
  transaction_desc text DEFAULT 'POS Sale',
  simulation_mode boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT mpesa_settings_business_uidx UNIQUE (business_id)
);

CREATE TABLE IF NOT EXISTS mpesa_stk_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  checkout_request_id text,
  merchant_request_id text,
  phone text NOT NULL,
  amount numeric(18, 2) NOT NULL,
  status text NOT NULL DEFAULT 'PENDING',
  mpesa_receipt text,
  result_code text,
  result_desc text,
  cash_account_id uuid,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS mpesa_stk_checkout_idx
  ON mpesa_stk_requests (checkout_request_id);
CREATE INDEX IF NOT EXISTS mpesa_stk_business_idx
  ON mpesa_stk_requests (business_id, created_at DESC);
