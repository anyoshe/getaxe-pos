import { Pool } from "pg";

export async function createMigrationTable(pool: Pool) {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS app_migrations (
      id SERIAL PRIMARY KEY,
      filename TEXT NOT NULL UNIQUE,
      checksum TEXT NOT NULL,
      executed_at TIMESTAMP DEFAULT NOW()
    );
  `);
}