import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  toStockQuantity,
  resolveToStock,
  costPerStockUnit,
  UnitConversionError,
  assertValidFactor,
} from "./services/unit-conversion.service";

describe("unit conversion", () => {
  it("converts boxes to capsules", () => {
    assert.equal(toStockQuantity(10, 100), 1000);
  });

  it("converts strips to capsules", () => {
    assert.equal(toStockQuantity(2, 10), 20);
  });

  it("rejects zero or negative factors", () => {
    assert.throws(() => assertValidFactor(0), UnitConversionError);
    assert.throws(() => assertValidFactor(-1), UnitConversionError);
  });

  it("resolveToStock uses product unit matrix", () => {
    const units = [
      { unitId: "cap", factorToStock: 1, isStockUnit: true, allowSale: true },
      { unitId: "strip", factorToStock: 10, allowSale: true },
      { unitId: "box", factorToStock: 100, allowSale: true, allowPurchase: true },
    ];
    const r = resolveToStock({
      productUnits: units,
      unitId: "box",
      quantityEntered: 10,
      requirePurchase: true,
    });
    assert.equal(r.quantityStock, 1000);
    assert.equal(r.factorToStock, 100);
  });

  it("defaults to stock unit when unit omitted", () => {
    const r = resolveToStock({
      productUnits: [
        { unitId: "cap", factorToStock: 1, isStockUnit: true },
      ],
      quantityEntered: 5,
    });
    assert.equal(r.quantityStock, 5);
  });

  it("computes cost per stock unit from box cost", () => {
    assert.equal(costPerStockUnit(800, 100), 8);
  });

  it("rejects sale on purchase-only unit", () => {
    assert.throws(
      () =>
        resolveToStock({
          productUnits: [
            { unitId: "pallet", factorToStock: 1000, allowSale: false },
          ],
          unitId: "pallet",
          quantityEntered: 1,
          requireSale: true,
        }),
      UnitConversionError,
    );
  });
});
