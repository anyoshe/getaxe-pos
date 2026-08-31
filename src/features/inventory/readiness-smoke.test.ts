import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { CapabilityResolver } from "../capabilities/services/capability-resolver";
import {
  HARDWARE_PROFILE,
  PHARMACY_PROFILE,
  SUPERMARKET_PROFILE,
} from "../capabilities/profiles";
import { productRuleResolver } from "./services/product-rule-resolver";
import { resolveUnitPrice, applyPromotion } from "./services/promotion-price";
import {
  canIssue,
  cycleCountVariance,
  nextOnHand,
  sortBatchesFefo,
} from "./services/stock-math";
import { toStockQuantity } from "./services/unit-conversion.service";

/**
 * End-to-end style pure smoke: profiles → product rules → multi-unit →
 * promo → issue check → cycle variance. No database required.
 */
describe("readiness smoke (pharmacy / retail / hardware)", () => {
  it("pharmacy profile exposes medicine wizard + batch + serial optional fields path", () => {
    const resolver = new CapabilityResolver();
    const caps = resolver.resolve(PHARMACY_PROFILE).map((c) => c.id);

    const rules = productRuleResolver.resolve({
      businessCapabilities: caps,
      productType: "medicine",
    });

    assert.ok(rules.steps.some((s) => s.id === "pharmacy" || s.id === "classification"));
    assert.ok(
      rules.requiredFields.includes("genericName") ||
        rules.fields.some((f) => f.key === "genericName"),
    );
  });

  it("supermarket can sell packs with correct stock deduction math", () => {
    // 2 boxes × 24 bottles = 48 stock units
    const stock = toStockQuantity(2, 24);
    assert.equal(stock, 48);

    const unitPrice = resolveUnitPrice({
      retailPrice: 50,
      wholesalePrice: 40,
      priceMode: "retail",
      unitId: "carton",
      factorToStock: 24,
    });
    assert.equal(unitPrice, 1200);

    const afterPromo = applyPromotion(unitPrice, "sku-1", [
      {
        id: "p1",
        name: "5% weekend",
        discountType: "PERCENT_OFF",
        discountValue: 5,
        scope: "ALL",
        productIds: [],
      },
    ]);
    assert.equal(afterPromo.price, 1140);

    assert.equal(canIssue(48, 24), true); // sell one carton
    assert.equal(nextOnHand(48, -24), 24);
  });

  it("hardware serial capability surfaces serialized field without forcing it on", () => {
    const rules = productRuleResolver.resolve({
      businessCapabilities: [
        "inventory.product-types",
        "inventory.serial-numbers",
      ],
      productType: "physical",
    });
    const ser = rules.fields.find((f) => f.key === "serialized");
    assert.ok(ser, "serialized field should be available");
    // Capability makes field available — not auto-required as true
    assert.notEqual(ser?.required === true && ser?.defaultValue === true, true);
  });

  it("cycle count posts variance equal to counted − system", () => {
    const system = 100;
    const counted = 97;
    const variance = cycleCountVariance(system, counted);
    assert.equal(variance, -3);
    assert.equal(wouldNotGoNegativeIfWeOnlyReduceByVariance(system, variance!), true);
  });

  it("dispensing FEFO prefers earliest batch", () => {
    const pick = sortBatchesFefo([
      { expiryDate: "2027-12-01", quantity: 50 },
      { expiryDate: "2026-05-01", quantity: 20 },
    ])[0];
    assert.equal(pick.expiryDate, "2026-05-01");
  });
});

function wouldNotGoNegativeIfWeOnlyReduceByVariance(
  system: number,
  variance: number,
): boolean {
  // Completing cycle count applies variance as adjustment delta
  return nextOnHand(system, variance) >= 0;
}
