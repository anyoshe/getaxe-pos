import assert from "node:assert/strict";
import { test } from "node:test";

import { productRuleResolver } from "./services/product-rule-resolver";

test("serialized field is available when inventory.serial-numbers is enabled", () => {
  const resolved = productRuleResolver.resolve({
    businessCapabilities: [
      "inventory.product-types",
      "inventory.serial-numbers",
    ],
    productType: "physical",
  });

  const field = resolved.fields.find((f) => f.key === "serialized");
  assert.ok(field, "serialized must appear in resolved fields");
  assert.equal(field.step, "inventory");
  assert.equal(field.required, undefined);
  assert.equal(field.capability, "inventory.serial-numbers");
});

test("serialized field is hidden when inventory.serial-numbers is disabled", () => {
  const resolved = productRuleResolver.resolve({
    businessCapabilities: ["inventory.product-types"],
    productType: "physical",
  });

  assert.ok(!resolved.fields.some((f) => f.key === "serialized"));
});

test("serialized field is only for physical and finished-product", () => {
  const caps = ["inventory.product-types", "inventory.serial-numbers"];

  assert.ok(
    productRuleResolver
      .resolve({ businessCapabilities: caps, productType: "physical" })
      .fields.some((f) => f.key === "serialized"),
  );
  assert.ok(
    productRuleResolver
      .resolve({ businessCapabilities: caps, productType: "finished-product" })
      .fields.some((f) => f.key === "serialized"),
  );
  assert.ok(
    !productRuleResolver
      .resolve({ businessCapabilities: caps, productType: "service" })
      .fields.some((f) => f.key === "serialized"),
  );
  assert.ok(
    !productRuleResolver
      .resolve({ businessCapabilities: caps, productType: "medicine" })
      .fields.some((f) => f.key === "serialized"),
  );
});
