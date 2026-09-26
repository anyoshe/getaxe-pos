-- Category-level wholesale markup % (separate from retail markup_percent)
ALTER TABLE categories
  ADD COLUMN IF NOT EXISTS wholesale_markup_percent numeric(8, 2);
