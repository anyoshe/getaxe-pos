import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  applyPromotion,
  resolveUnitPrice,
} from "./services/promotion-price";

describe("promotional pricing", () => {
  const promos = [
    {
      id: "1",
      name: "10% off all",
      discountType: "PERCENT_OFF",
      discountValue: 10,
      scope: "ALL",
      productIds: [],
    },
    {
      id: "2",
      name: "Fixed 50",
      discountType: "FIXED_PRICE",
      discountValue: 50,
      scope: "SELECTED",
      productIds: ["prod-a"],
    },
    {
      id: "3",
      name: "20 off selected",
      discountType: "AMOUNT_OFF",
      discountValue: 20,
      scope: "SELECTED",
      productIds: ["prod-b"],
    },
  ];

  it("applies percent off to all products", () => {
    const r = applyPromotion(100, "prod-x", [promos[0]]);
    assert.equal(r.price, 90);
    assert.equal(r.promoName, "10% off all");
  });

  it("uses best (lowest) price when multiple match", () => {
    const r = applyPromotion(100, "prod-a", promos);
    // fixed 50 beats 10% (90)
    assert.equal(r.price, 50);
    assert.equal(r.promoId, "2");
  });

  it("ignores selected-scope promos for other products", () => {
    const r = applyPromotion(100, "prod-z", [promos[1], promos[2]]);
    assert.equal(r.price, 100);
    assert.equal(r.promoName, null);
  });

  it("never returns negative prices", () => {
    const r = applyPromotion(10, "prod-b", [promos[2]]);
    assert.equal(r.price, 0);
  });

  it("resolveUnitPrice uses pack price when set", () => {
    assert.equal(
      resolveUnitPrice({
        retailPrice: 15,
        wholesalePrice: 12,
        priceMode: "retail",
        unitId: "box",
        factorToStock: 10,
        pricesByUnit: { box: 140 },
      }),
      140,
    );
  });

  it("resolveUnitPrice multiplies factor when no pack price", () => {
    assert.equal(
      resolveUnitPrice({
        retailPrice: 15,
        wholesalePrice: 12,
        priceMode: "retail",
        unitId: "box",
        factorToStock: 10,
      }),
      150,
    );
  });

  it("resolveUnitPrice respects wholesale mode", () => {
    assert.equal(
      resolveUnitPrice({
        retailPrice: 15,
        wholesalePrice: 12,
        priceMode: "wholesale",
        factorToStock: 1,
      }),
      12,
    );
  });
});
