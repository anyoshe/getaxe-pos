-- eTIMS Phase A: per-business on/off + simulation stamps (no live KRA calls)
CREATE TABLE IF NOT EXISTS etims_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  enabled boolean NOT NULL DEFAULT false,
  environment text NOT NULL DEFAULT 'simulation',
  kra_pin text,
  branch_id text,
  device_serial text,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT etims_settings_business_uidx UNIQUE (business_id)
);

ALTER TABLE sales
  ADD COLUMN IF NOT EXISTS etims_status text,
  ADD COLUMN IF NOT EXISTS etims_cu_invoice_number text,
  ADD COLUMN IF NOT EXISTS etims_qr_payload text,
  ADD COLUMN IF NOT EXISTS etims_message text,
  ADD COLUMN IF NOT EXISTS etims_posted_at timestamptz;

CREATE INDEX IF NOT EXISTS sales_etims_status_idx ON sales (business_id, etims_status);
