import assert from "node:assert/strict";
import test from "node:test";

import {
  CAPABILITIES,
  validateCapabilityCatalogue,
} from "./constants/capabilities";
import {
  CapabilityRegistry,
} from "./services/capability-registry";

test("capability catalogue has no duplicate ids or codes and all dependencies resolve", () => {
  const issues = validateCapabilityCatalogue(CAPABILITIES);

  assert.deepEqual(issues, []);
});

test("registry resolves the full canonical catalogue without collisions", () => {
  const registry = new CapabilityRegistry();

  assert.equal(registry.all().length, CAPABILITIES.length);
  assert.equal(new Set(CAPABILITIES.map(capability => capability.id)).size, CAPABILITIES.length);
  assert.equal(new Set(CAPABILITIES.map(capability => capability.code)).size, CAPABILITIES.length);
});

test("registry lookup keeps canonical ids and codes aligned", () => {
  const registry = new CapabilityRegistry();

  const capability = registry.get("sales.pos");
  assert.ok(capability);
  assert.equal(capability?.code, "POINT_OF_SALE");
  assert.equal(registry.getByCode("POINT_OF_SALE")?.id, "sales.pos");
});
