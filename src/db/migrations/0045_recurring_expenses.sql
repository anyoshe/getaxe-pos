CREATE TABLE IF NOT EXISTS recurring_expenses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  category_id uuid NOT NULL REFERENCES expense_categories(id),
  name text NOT NULL,
  amount numeric(12, 2) NOT NULL,
  day_of_month integer NOT NULL DEFAULT 1,
  notes text,
  active boolean NOT NULL DEFAULT true,
  created_by uuid REFERENCES users(id),
  created_at timestamp NOT NULL DEFAULT now(),
  updated_at timestamp NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS recurring_expenses_business_idx
  ON recurring_expenses (business_id);

CREATE INDEX IF NOT EXISTS recurring_expenses_active_idx
  ON recurring_expenses (business_id, active);
