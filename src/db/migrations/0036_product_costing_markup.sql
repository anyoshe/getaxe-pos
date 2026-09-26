-- Moving average / last purchase cost + category & product markup for auto pricing
ALTER TABLE products
  ADD COLUMN IF NOT EXISTS last_purchase_cost numeric(12, 4),
  ADD COLUMN IF NOT EXISTS markup_percent numeric(8, 2),
  ADD COLUMN IF NOT EXISTS price_locked boolean NOT NULL DEFAULT false;

ALTER TABLE categories
  ADD COLUMN IF NOT EXISTS markup_percent numeric(8, 2);

UPDATE products
SET last_purchase_cost = cost_price
WHERE cost_price IS NOT NULL
  AND last_purchase_cost IS NULL;
