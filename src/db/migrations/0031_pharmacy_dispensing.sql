CREATE TABLE IF NOT EXISTS dispensings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses(id),
  warehouse_id UUID NOT NULL REFERENCES warehouses(id),
  customer_id UUID,
  patient_name TEXT,
  prescription_ref TEXT,
  status TEXT NOT NULL DEFAULT 'DRAFT',
  notes TEXT,
  dispensed_by UUID REFERENCES users(id),
  dispensed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS dispensings_business_idx ON dispensings(business_id);
CREATE INDEX IF NOT EXISTS dispensings_status_idx ON dispensings(status);

CREATE TABLE IF NOT EXISTS dispensing_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses(id),
  dispensing_id UUID NOT NULL REFERENCES dispensings(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id),
  batch_id UUID REFERENCES product_batches(id),
  quantity NUMERIC(18, 4) NOT NULL,
  dosage_instructions TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS dispensing_items_dispensing_idx ON dispensing_items(dispensing_id);
CREATE INDEX IF NOT EXISTS dispensing_items_product_idx ON dispensing_items(product_id);
