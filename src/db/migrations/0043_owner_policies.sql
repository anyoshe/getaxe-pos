-- Below-cost sale policy: off | warn | block (default block)
ALTER TABLE business_settings
  ADD COLUMN IF NOT EXISTS below_cost_sale_policy text NOT NULL DEFAULT 'block';

-- Optional footer on printed receipts / POs (status branding for pilots)
ALTER TABLE businesses
  ADD COLUMN IF NOT EXISTS document_footer text;
