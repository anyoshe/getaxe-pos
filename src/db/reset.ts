/**
 * Wipe the database and rebuild from migrations + full system seed.
 *
 * Usage:
 *   pnpm db:reset
 *
 * Requires DATABASE_URL. Destroys ALL tenant data (businesses, sales, stock, …).
 * Always re-seeds roles, permissions, super-admin, units, currencies, capabilities.
 */
import "dotenv/config";
import { Pool } from "pg";
import { spawn } from "child_process";
import path from "path";

function run(cmd: string, args: string[]): Promise<void> {
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, args, {
      stdio: "inherit",
      cwd: process.cwd(),
      env: process.env,
      shell: process.platform === "win32",
    });
    child.on("exit", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`${cmd} ${args.join(" ")} exited with ${code}`));
    });
    child.on("error", reject);
  });
}

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error("DATABASE_URL is not set (.env / .env.local).");
    process.exit(1);
  }

  // Safety: refuse obvious production hosts unless FORCE_DB_RESET=1
  const forced = process.env.FORCE_DB_RESET === "1";
  if (
    !forced &&
    /(prod|production|aws|azure|neon\.tech|supabase)/i.test(url) &&
    !/localhost|127\.0\.0\.1/.test(url)
  ) {
    console.error(
      "Refusing to reset a non-local DATABASE_URL. Set FORCE_DB_RESET=1 if you are sure.",
    );
    process.exit(1);
  }

  console.log("⚠️  GetAxe DB RESET — all tenant data will be deleted.\n");

  const pool = new Pool({ connectionString: url });
  const client = await pool.connect();
  try {
    console.log("→ DROP SCHEMA public CASCADE");
    await client.query("DROP SCHEMA IF EXISTS public CASCADE");
    await client.query("CREATE SCHEMA public");
    await client.query("GRANT ALL ON SCHEMA public TO public");
    // restore default privileges for the connecting role
    await client.query("GRANT ALL ON SCHEMA public TO CURRENT_USER");
    console.log("→ Schema recreated\n");
  } finally {
    client.release();
    await pool.end();
  }

  const tsx = path.join(
    process.cwd(),
    "node_modules",
    ".bin",
    process.platform === "win32" ? "tsx.cmd" : "tsx",
  );

  console.log("→ Running migrations (pnpm db:migrate)");
  await run("pnpm", ["exec", "tsx", "src/db/migrate.ts"]);

  console.log("\n→ Running full system seed (pnpm db:seed)");
  await run("pnpm", ["exec", "tsx", "src/db/seed/index.ts"]);

  console.log("\n🎉 Clean slate ready. Platform: superadmin@getaxe.tech / Admin@12345\n");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
