/**
 * Full system seed — safe to re-run (idempotent where possible).
 * Seeds everything the app needs without a tenant business:
 * permissions, roles, platform super-admin, global units/currencies/etc.,
 * and the capabilities catalogue.
 *
 * Per-business data (branch, warehouse, CoA, admin user) is created
 * during /setup via businessProvisioningService — not here.
 */
import { client } from "@/db";

import { seedSystemPermissions } from "./system/permissions";
import { seedSystemRoles } from "./system/roles";
import { seedSystemRolePermissions } from "./system/role-permissions";
import { seedSuperAdmin } from "./platform/super-admin";
import { seedGlobalUnits } from "./global/units";
import { seedCurrencies } from "./global/currencies";
import { seedCountries } from "./global/countries";
import { seedTaxRates } from "./global/tax-rates";
import { seedPaymentMethods } from "./global/payment-methods";
import { capabilitySyncService } from "@/features/capabilities/services/capability-sync.service";

async function main() {
  console.log("🚀 GetAxe system seed starting…\n");

  // ── RBAC ──────────────────────────────────────────────
  console.log("→ System permissions");
  await seedSystemPermissions();

  console.log("→ System roles");
  await seedSystemRoles();

  console.log("→ Role ↔ permission matrix");
  await seedSystemRolePermissions();

  // ── Platform ──────────────────────────────────────────
  console.log("→ Platform SUPER_ADMIN");
  await seedSuperAdmin();

  // ── Global reference data (no business_id) ────────────
  console.log("→ Global units");
  await seedGlobalUnits();

  console.log("→ Currencies");
  await seedCurrencies();

  console.log("→ Countries");
  await seedCountries();

  console.log("→ Tax rates (global templates)");
  await seedTaxRates();

  console.log("→ Payment methods (global templates)");
  await seedPaymentMethods();

  // ── Capabilities catalogue rows ───────────────────────
  console.log("→ Capabilities catalogue sync");
  await capabilitySyncService.sync();

  console.log("\n✅ Database seed completed.\n");
  console.log("Platform login:");
  console.log("  URL:      /platform/login");
  console.log("  Email:    superadmin@getaxe.tech");
  console.log("  Password: Admin@12345");
  console.log("\nNext: invite a business owner → they login at /login → /setup\n");
}

main()
  .then(async () => {
    await client.end();
    process.exit(0);
  })
  .catch(async (error) => {
    console.error("❌ Seed failed:", error);
    await client.end();
    process.exit(1);
  });
