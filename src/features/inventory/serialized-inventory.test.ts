import assert from "node:assert/strict";
import { test } from "node:test";

import { productRuleResolver } from "./services/product-rule-resolver";

test("serialized field is available for physical products (per-product toggle)", () => {
  const resolved = productRuleResolver.resolve({
    businessCapabilities: ["inventory.product-types"],
    productType: "physical",
  });

  const field = resolved.fields.find((f) => f.key === "serialized");
  assert.ok(field, "serialized must appear in resolved fields for physical products");
  assert.equal(field.step, "inventory");
});

test("serialized field is available for finished-product", () => {
  const resolved = productRuleResolver.resolve({
    businessCapabilities: ["inventory.product-types"],
    productType: "finished-product",
  });

  assert.ok(resolved.fields.some((f) => f.key === "serialized"));
});

test("serialized field is not shown for service products", () => {
  const resolved = productRuleResolver.resolve({
    businessCapabilities: ["inventory.product-types", "inventory.serial-numbers"],
    productType: "service",
  });

  assert.ok(!resolved.fields.some((f) => f.key === "serialized"));
});

test("serialized field is not shown for medicine products", () => {
  const resolved = productRuleResolver.resolve({
    businessCapabilities: [
      "inventory.product-types",
      "inventory.serial-numbers",
      "pharmacy.medicine-catalogue",
    ],
    productType: "medicine",
  });

  assert.ok(!resolved.fields.some((f) => f.key === "serialized"));
});
