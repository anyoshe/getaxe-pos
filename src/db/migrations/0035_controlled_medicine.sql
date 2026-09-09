ALTER TABLE products
  ADD COLUMN IF NOT EXISTS is_controlled boolean DEFAULT false NOT NULL;

CREATE INDEX IF NOT EXISTS products_controlled_idx
  ON products (business_id)
  WHERE is_controlled = true;
