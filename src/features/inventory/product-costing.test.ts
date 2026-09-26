import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  computeMovingAverageCost,
  costBasisForPricing,
  effectiveMarkupPercent,
  projectCostAfterReceive,
  suggestSellPrice,
} from "./services/product-costing";

describe("product costing — moving average", () => {
  it("uses receipt cost when stock was empty", () => {
    const avg = computeMovingAverageCost({
      qtyOnHand: 0,
      currentAverageCost: null,
      qtyReceived: 100,
      receiptUnitCost: 40,
    });
    assert.equal(avg, 40);
  });

  it("blends old average with new receipt", () => {
    const avg = computeMovingAverageCost({
      qtyOnHand: 100,
      currentAverageCost: 10,
      qtyReceived: 100,
      receiptUnitCost: 20,
    });
    assert.equal(avg, 15);
  });

  it("weights unequal quantities", () => {
    const avg = computeMovingAverageCost({
      qtyOnHand: 50,
      currentAverageCost: 10,
      qtyReceived: 150,
      receiptUnitCost: 20,
    });
    assert.equal(avg, 17.5);
  });
});

describe("product costing — markup sell price", () => {
  it("product markup overrides category", () => {
    assert.equal(effectiveMarkupPercent(50, 30), 50);
    assert.equal(effectiveMarkupPercent(null, 30), 30);
    assert.equal(effectiveMarkupPercent(undefined, null), 0);
  });

  it("suggests sell from cost + markup on cost", () => {
    assert.equal(suggestSellPrice(40, 50), 60);
    assert.equal(suggestSellPrice(15, 30, 1), 20);
  });

  it("pricing basis max-of-both prefers higher replacement", () => {
    assert.equal(costBasisForPricing(12, 18, "MAX_OF_BOTH"), 18);
    assert.equal(costBasisForPricing(12, 18, "MOVING_AVERAGE"), 12);
    assert.equal(costBasisForPricing(12, 18, "LAST_PURCHASE"), 18);
  });

  it("projects full receive outcome", () => {
    const r = projectCostAfterReceive({
      qtyOnHandBeforeReceive: 100,
      currentAverageCost: 10,
      qtyReceivedStock: 100,
      receiptCostPerStockUnit: 20,
      categoryMarkupPercent: 50,
      priceLocked: false,
    });
    assert.equal(r.newAverageCost, 15);
    assert.equal(r.lastPurchaseCost, 20);
    assert.equal(r.suggestedSellPrice, 23);
    assert.equal(r.markupPercent, 50);
  });

  it("does not invent sell price without markup", () => {
    const r = projectCostAfterReceive({
      qtyOnHandBeforeReceive: 0,
      currentAverageCost: null,
      qtyReceivedStock: 10,
      receiptCostPerStockUnit: 100,
      categoryMarkupPercent: 0,
    });
    assert.equal(r.newAverageCost, 100);
    assert.equal(r.suggestedSellPrice, null);
  });
});
