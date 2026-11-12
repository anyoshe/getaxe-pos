-- Programme vs private supply channel (TB/HIV and similar packs)
ALTER TABLE products
  ADD COLUMN IF NOT EXISTS supply_channel text NOT NULL DEFAULT 'private';

CREATE INDEX IF NOT EXISTS products_business_supply_channel_idx
  ON products (business_id, supply_channel);
