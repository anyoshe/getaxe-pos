import "dotenv/config";

import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";

import * as schema from "./schema";

/**
 * Serverless-friendly pool settings (Vercel / Neon).
 * prepare:false required for some Neon/pgbouncer setups.
 */
export const client = postgres(process.env.DATABASE_URL!, {
  prepare: false,
  max: 10,
  idle_timeout: 20,
  connect_timeout: 10,
  max_lifetime: 60 * 30,
});

export const db = drizzle(client, {
  schema,
});
