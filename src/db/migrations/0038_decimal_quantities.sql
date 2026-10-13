-- Allow fractional quantities for mass/volume stock (kg, L, g, ml, etc.)
-- Inventory balances/movements already numeric(18,6); purchase & sale line qty were integer.

ALTER TABLE purchase_order_items
  ALTER COLUMN quantity TYPE numeric(18, 6) USING quantity::numeric,
  ALTER COLUMN received_quantity TYPE numeric(18, 6) USING received_quantity::numeric;

ALTER TABLE goods_receipt_items
  ALTER COLUMN quantity TYPE numeric(18, 6) USING quantity::numeric;

ALTER TABLE supplier_return_items
  ALTER COLUMN quantity TYPE numeric(18, 6) USING quantity::numeric;

ALTER TABLE sale_items
  ALTER COLUMN quantity TYPE numeric(18, 6) USING quantity::numeric,
  ALTER COLUMN quantity_stock TYPE numeric(18, 6) USING quantity_stock::numeric;

ALTER TABLE sale_item_batches
  ALTER COLUMN quantity TYPE numeric(18, 6) USING quantity::numeric;

ALTER TABLE sale_return_items
  ALTER COLUMN quantity TYPE numeric(18, 6) USING quantity::numeric;
