import { sql } from "drizzle-orm";

import { db } from "@/db";

let ensured = false;
let ensurePromise: Promise<void> | null = null;

/**
 * Idempotent: adds markup / moving-average columns if missing (e.g. Neon
 * never ran migration 0036). Safe to call on every request; runs once per
 * serverless isolate after success.
 */
export async function ensureProductCostingSchema(): Promise<void> {
  if (ensured) return;
  if (ensurePromise) return ensurePromise;

  ensurePromise = (async () => {
    try {
      await db.execute(sql`
        ALTER TABLE products
          ADD COLUMN IF NOT EXISTS last_purchase_cost numeric(12, 4),
          ADD COLUMN IF NOT EXISTS markup_percent numeric(8, 2),
          ADD COLUMN IF NOT EXISTS price_locked boolean NOT NULL DEFAULT false
      `);
      await db.execute(sql`
        ALTER TABLE categories
          ADD COLUMN IF NOT EXISTS markup_percent numeric(8, 2)
      `);
      await db.execute(sql`
        UPDATE products
        SET last_purchase_cost = cost_price
        WHERE cost_price IS NOT NULL
          AND last_purchase_cost IS NULL
      `);
      // Best-effort migration bookkeeping (table may not exist on some envs)
      try {
        await db.execute(sql`
          CREATE TABLE IF NOT EXISTS app_migrations (
            id SERIAL PRIMARY KEY,
            filename TEXT UNIQUE NOT NULL,
            checksum TEXT NOT NULL,
            executed_at TIMESTAMP DEFAULT NOW()
          )
        `);
        await db.execute(sql`
          INSERT INTO app_migrations (filename, checksum)
          VALUES (
            '0036_product_costing_markup.sql',
            '3e6d7e1d115ae1ef5aeb1f7043968fbd7f296323d3473f9ed0416eb930cc63d6'
          )
          ON CONFLICT (filename) DO NOTHING
        `);
      } catch {
        // ignore bookkeeping failures
      }
      ensured = true;
    } catch (err) {
      ensurePromise = null;
      throw err;
    }
  })();

  return ensurePromise;
}
