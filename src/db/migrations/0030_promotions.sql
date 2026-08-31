CREATE TABLE IF NOT EXISTS promotions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses(id),
  code TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  -- PERCENT_OFF | AMOUNT_OFF | FIXED_PRICE
  discount_type TEXT NOT NULL DEFAULT 'PERCENT_OFF',
  discount_value NUMERIC(12, 4) NOT NULL DEFAULT 0,
  starts_at TIMESTAMP WITH TIME ZONE,
  ends_at TIMESTAMP WITH TIME ZONE,
  -- ALL | SELECTED
  scope TEXT NOT NULL DEFAULT 'ALL',
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS promotions_business_code_unique
  ON promotions (business_id, code);
CREATE INDEX IF NOT EXISTS promotions_business_idx ON promotions(business_id);
CREATE INDEX IF NOT EXISTS promotions_active_idx ON promotions(active);

CREATE TABLE IF NOT EXISTS promotion_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses(id),
  promotion_id UUID NOT NULL REFERENCES promotions(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS promotion_products_unique
  ON promotion_products (promotion_id, product_id);
CREATE INDEX IF NOT EXISTS promotion_products_product_idx
  ON promotion_products (product_id);
