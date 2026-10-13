/**
 * Load env the same way Next prefers: .env.local overrides .env.
 * dotenv/config alone only loads .env, so migrate/seed would hit Neon
 * while `next dev` uses localhost from .env.local.
 */
import { config } from "dotenv";
import path from "path";

const root = process.cwd();

config({ path: path.join(root, ".env") });
config({ path: path.join(root, ".env.local"), override: true });
