import assert from "node:assert/strict";
import { test } from "node:test";

import { productRuleResolver } from "./services/product-rule-resolver";

test("serialized field is available when inventory.serial-numbers is enabled (physical)", () => {
  const resolved = productRuleResolver.resolve({
    businessCapabilities: [
      "inventory.product-types",
      "inventory.serial-numbers",
    ],
    productType: "physical",
  });

  const field = resolved.fields.find((f) => f.key === "serialized");
  assert.ok(
    field,
    "serialized must appear when serial-numbers capability is on",
  );
  assert.equal(field.step, "inventory");
});

test("serialized field is available for finished-product with capability", () => {
  const resolved = productRuleResolver.resolve({
    businessCapabilities: [
      "inventory.product-types",
      "inventory.serial-numbers",
    ],
    productType: "finished-product",
  });

  assert.ok(resolved.fields.some((f) => f.key === "serialized"));
});

test("serialized field is hidden when serial-numbers capability is off", () => {
  const resolved = productRuleResolver.resolve({
    businessCapabilities: ["inventory.product-types"],
    productType: "physical",
  });

  assert.ok(!resolved.fields.some((f) => f.key === "serialized"));
});

test("serialized field is not shown for service products", () => {
  const resolved = productRuleResolver.resolve({
    businessCapabilities: [
      "inventory.product-types",
      "inventory.serial-numbers",
    ],
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
