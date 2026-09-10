import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

test("go-live docs and backup scripts exist", () => {
  assert.ok(existsSync(resolve("docs/GO_LIVE.md")));
  assert.ok(existsSync(resolve("scripts/backup-db.sh")));
  assert.ok(existsSync(resolve("scripts/restore-db.sh")));
  assert.ok(existsSync(resolve("scripts/install-backup-cron.sh")));
  assert.ok(existsSync(resolve("docs/STAFF_SOP.md")));
});

test("controlled medicine migration and field wiring", () => {
  const mig = readFileSync(
    resolve("src/db/migrations/0035_controlled_medicine.sql"),
    "utf8",
  );
  assert.match(mig, /is_controlled/);
  const schema = readFileSync(
    resolve("src/db/schema/inventory/products.ts"),
    "utf8",
  );
  assert.match(schema, /isControlled/);
  const rules = readFileSync(
    resolve("src/features/inventory/services/product-rule-resolver.ts"),
    "utf8",
  );
  assert.match(rules, /isControlled/);
});

test("batch COGS helper is present in financial statements", () => {
  const src = readFileSync(
    resolve("src/features/reports/services/financial-statements.service.ts"),
    "utf8",
  );
  assert.match(src, /operationalCogs/);
  assert.match(src, /saleItemBatches/);
});
