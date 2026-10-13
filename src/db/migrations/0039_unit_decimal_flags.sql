-- Mark mass/volume units as decimal-capable; count units stay whole-number only.
UPDATE units
SET allow_decimals = true,
    updated_at = NOW()
WHERE lower(coalesce(category, '')) IN ('mass', 'volume')
   OR upper(code) IN ('KG', 'G', 'MG', 'LTR', 'L', 'ML', 'CL', 'TON', 'LB');

UPDATE units
SET allow_decimals = false,
    updated_at = NOW()
WHERE lower(coalesce(category, '')) IN ('count', 'length', 'area')
  AND upper(code) NOT IN ('KG', 'G', 'MG', 'LTR', 'L', 'ML', 'CL', 'TON', 'LB');
