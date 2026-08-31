import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { existsSync } from "node:fs";
import path from "node:path";

import { CAPABILITY_WIRING } from "./constants/capability-wiring";

/** Default when catalogue id is not listed — treated as roadmap. */
function wiringStatus(id: string) {
  return CAPABILITY_WIRING[id]?.status ?? "roadmap";
}

describe("capability wiring hardening", () => {
  it("wired capabilities with routes use absolute app paths", () => {
    for (const [id, w] of Object.entries(CAPABILITY_WIRING)) {
      if (w.status !== "wired" || !w.routes?.length) continue;
      for (const route of w.routes) {
        assert.ok(
          route.startsWith("/"),
          `${id} route must be absolute path: ${route}`,
        );
      }
    }
  });

  it("core go-live capabilities are wired", () => {
    const required = [
      "sales.pos",
      "inventory.product-types",
      "inventory.stock-adjustment",
      "inventory.cycle-count",
      "inventory.promotional-pricing",
      "inventory.serial-numbers",
      "inventory.batch-control",
      "pharmacy.dispensing",
    ];
    for (const id of required) {
      assert.equal(
        wiringStatus(id),
        "wired",
        `${id} should be wired for go-live (got ${wiringStatus(id)})`,
      );
    }
  });

  it("key page files exist for hardened modules", () => {
    const root = process.cwd();
    const files = [
      "src/app/(dashboard)/inventory/cycle-counts/page.tsx",
      "src/app/(dashboard)/inventory/promotions/page.tsx",
      "src/app/(dashboard)/pharmacy/dispensing/page.tsx",
      "src/features/inventory/services/promotion-price.ts",
      "src/features/inventory/services/stock-math.ts",
    ];
    for (const f of files) {
      assert.ok(existsSync(path.join(root, f)), `missing ${f}`);
    }
  });

  it("no wiring entry claims wired without a route or note", () => {
    for (const [id, w] of Object.entries(CAPABILITY_WIRING)) {
      if (w.status !== "wired") continue;
      assert.ok(
        (w.routes && w.routes.length > 0) || w.note,
        `${id} is wired but has no routes/note`,
      );
    }
  });
});
