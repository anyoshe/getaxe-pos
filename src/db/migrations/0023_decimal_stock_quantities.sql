-- Allow decimal stock quantities for mass/volume/length products
ALTER TABLE "inventory_balances"
  ALTER COLUMN "quantity" TYPE numeric(18, 6)
  USING "quantity"::numeric(18, 6);

ALTER TABLE "product_batches"
  ALTER COLUMN "quantity_received" TYPE numeric(18, 6)
  USING "quantity_received"::numeric(18, 6);

ALTER TABLE "product_batches"
  ALTER COLUMN "quantity_remaining" TYPE numeric(18, 6)
  USING "quantity_remaining"::numeric(18, 6);

-- sale_items.quantity stays integer for legacy; quantity_stock can be decimal
ALTER TABLE "sale_items"
  ALTER COLUMN "quantity_stock" TYPE numeric(18, 6)
  USING "quantity_stock"::numeric(18, 6);

ALTER TABLE "stock_movements"
  ALTER COLUMN "quantity" TYPE numeric(18, 6)
  USING "quantity"::numeric(18, 6);
