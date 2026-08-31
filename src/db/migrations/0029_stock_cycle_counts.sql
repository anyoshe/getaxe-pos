-- Cycle counts (stock take sessions) and line items
CREATE TABLE IF NOT EXISTS stock_counts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses(id),
  warehouse_id UUID NOT NULL REFERENCES warehouses(id),
  status TEXT NOT NULL DEFAULT 'DRAFT',
  reference TEXT,
  notes TEXT,
  counted_by UUID REFERENCES users(id),
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS stock_counts_business_idx ON stock_counts(business_id);
CREATE INDEX IF NOT EXISTS stock_counts_warehouse_idx ON stock_counts(warehouse_id);
CREATE INDEX IF NOT EXISTS stock_counts_status_idx ON stock_counts(status);

CREATE TABLE IF NOT EXISTS stock_count_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses(id),
  stock_count_id UUID NOT NULL REFERENCES stock_counts(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id),
  batch_id UUID REFERENCES product_batches(id),
  system_quantity NUMERIC(18, 4) NOT NULL DEFAULT 0,
  counted_quantity NUMERIC(18, 4),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS stock_count_items_count_idx ON stock_count_items(stock_count_id);
CREATE INDEX IF NOT EXISTS stock_count_items_product_idx ON stock_count_items(product_id);
CREATE UNIQUE INDEX IF NOT EXISTS stock_count_items_unique_line
  ON stock_count_items (stock_count_id, product_id, COALESCE(batch_id, '00000000-0000-0000-0000-000000000000'::uuid));
