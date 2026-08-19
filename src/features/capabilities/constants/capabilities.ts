import type {
  CapabilityDefinition,
} from "../types";

import {
  CORE_CAPABILITIES,
  INVENTORY_CAPABILITIES,
  SALES_CAPABILITIES,
  PURCHASING_CAPABILITIES,
  FINANCE_CAPABILITIES,
  PHARMACY_CAPABILITIES,
  REPORTING_CAPABILITIES,
} from "./catalogue";

export function validateCapabilityCatalogue(
  catalogue: CapabilityDefinition[],
): string[] {
  const errors: string[] = [];
  const byId = new Map<string, CapabilityDefinition>();
  const byCode = new Map<string, CapabilityDefinition>();

  for (const capability of catalogue) {
    if (!capability.id) {
      errors.push("Capability is missing an id.");
    }

    if (!capability.code) {
      errors.push(`Capability ${capability.id ?? "unknown"} is missing a code.`);
    }

    if (byId.has(capability.id)) {
      errors.push(`Duplicate capability id: ${capability.id}`);
    } else {
      byId.set(capability.id, capability);
    }

    if (byCode.has(capability.code)) {
      errors.push(`Duplicate capability code: ${capability.code}`);
    } else {
      byCode.set(capability.code, capability);
    }
  }

  for (const capability of catalogue) {
    for (const dependency of capability.dependencies) {
      if (!byId.has(dependency)) {
        errors.push(
          `Capability ${capability.id} depends on unknown capability ${dependency}`,
        );
      }
    }

    for (const conflict of capability.conflicts) {
      if (!byId.has(conflict)) {
        errors.push(
          `Capability ${capability.id} conflicts with unknown capability ${conflict}`,
        );
      }
    }

    if (capability.dependencies.includes(capability.id)) {
      errors.push(`Capability ${capability.id} cannot depend on itself.`);
    }

    if (capability.conflicts.includes(capability.id)) {
      errors.push(`Capability ${capability.id} cannot conflict with itself.`);
    }
  }

  const visited = new Set<string>();
  const active = new Set<string>();

  const visit = (capabilityId: string) => {
    if (active.has(capabilityId)) {
      errors.push(`Circular dependency detected at capability ${capabilityId}.`);
      return;
    }

    if (visited.has(capabilityId)) {
      return;
    }

    const capability = byId.get(capabilityId);
    if (!capability) {
      return;
    }

    active.add(capabilityId);

    for (const dependency of capability.dependencies) {
      if (byId.has(dependency)) {
        visit(dependency);
      }
    }

    active.delete(capabilityId);
    visited.add(capabilityId);
  };

  for (const capability of catalogue) {
    visit(capability.id);
  }

  return errors;
}

export const CAPABILITIES = [
  ...CORE_CAPABILITIES,
  ...INVENTORY_CAPABILITIES,
  ...SALES_CAPABILITIES,
  ...PURCHASING_CAPABILITIES,
  ...FINANCE_CAPABILITIES,
  ...PHARMACY_CAPABILITIES,
  ...REPORTING_CAPABILITIES,
];

const capabilityCatalogueErrors = validateCapabilityCatalogue(CAPABILITIES);

if (capabilityCatalogueErrors.length > 0) {
  throw new Error(
    `Capability catalogue validation failed:\n${capabilityCatalogueErrors.join("\n")}`,
  );
}