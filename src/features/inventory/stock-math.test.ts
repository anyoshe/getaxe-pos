import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  canIssue,
  cycleCountVariance,
  nextOnHand,
  sortBatchesFefo,
  wouldGoNegative,
} from "./services/stock-math";
import { qty, qtyStr } from "@/lib/quantity";

describe("stock math (cycle count / issue / adjust)", () => {
  it("cycle count variance is counted − system", () => {
    assert.equal(cycleCountVariance(10, 8), -2);
    assert.equal(cycleCountVariance(10, 12), 2);
    assert.equal(cycleCountVariance(10, 10), 0);
    assert.equal(cycleCountVariance(10, null), null);
  });

  it("blocks issue when insufficient on hand", () => {
    assert.equal(canIssue(5, 3), true);
    assert.equal(canIssue(5, 5), true);
    assert.equal(canIssue(5, 6), false);
    assert.equal(canIssue(0, 1), false);
  });

  it("detects negative after adjustment", () => {
    assert.equal(wouldGoNegative(4, -3), false);
    assert.equal(wouldGoNegative(4, -5), true);
    assert.equal(nextOnHand(4, -2), 2);
  });

  it("qty helpers round-trip for numeric columns", () => {
    assert.equal(qty("15.0000"), 15);
    assert.equal(qtyStr(90), "90");
    assert.equal(qty(null), 0);
  });

  it("FEFO sorts earliest expiry first", () => {
    const sorted = sortBatchesFefo([
      { expiryDate: "2027-01-01", quantity: 10, id: "c" },
      { expiryDate: "2026-06-01", quantity: 5, id: "a" },
      { expiryDate: null, quantity: 3, id: "d" },
      { expiryDate: "2026-03-01", quantity: 0, id: "empty" },
    ]);
    assert.deepEqual(
      sorted.map((b) => b.id),
      ["a", "c", "d"],
    );
  });
});
