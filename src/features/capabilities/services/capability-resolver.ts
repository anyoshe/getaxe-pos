import type {
  CapabilityDefinition,
  CapabilityProfile,
} from "../types";

import {
  CapabilityRegistry,
} from "./capability-registry";

export class CapabilityResolver {
  constructor(
    private readonly registry = new CapabilityRegistry(),
  ) {}

  resolve(profile: CapabilityProfile): CapabilityDefinition[] {
    const resolved = new Map<string, CapabilityDefinition>();
    const disabledSet = new Set(profile.disabled);
    const requestedIds = new Set([
      ...profile.enabled,
      ...profile.disabled,
    ]);

    for (const requestedId of requestedIds) {
      if (!this.registry.exists(requestedId)) {
        throw new Error(`Unknown capability ID requested: ${requestedId}`);
      }
    }

    for (const capability of this.registry.all()) {
      const supportedIndustry =
        capability.industries.length === 0 ||
        capability.industries.includes(profile.businessType);

      if (supportedIndustry && capability.defaultEnabled) {
        this.addWithDependencies(capability.id, resolved, new Set());
      }
    }

    for (const capabilityId of profile.enabled) {
      this.addWithDependencies(capabilityId, resolved, new Set());
    }

    for (const capabilityId of Array.from(resolved.keys())) {
      if (disabledSet.has(capabilityId)) {
        resolved.delete(capabilityId);
      }
    }

    for (const capability of Array.from(resolved.values())) {
      for (const dependency of capability.dependencies) {
        if (disabledSet.has(dependency)) {
          throw new Error(
            `Capability ${capability.id} depends on disabled capability ${dependency}.`,
          );
        }
      }
    }

    for (const capability of Array.from(resolved.values())) {
      for (const conflict of capability.conflicts) {
        if (resolved.has(conflict)) {
          throw new Error(
            `Capability conflict detected: ${capability.id} cannot coexist with ${conflict}.`,
          );
        }
      }
    }

    return Array.from(resolved.values()).sort((a, b) => a.id.localeCompare(b.id));
  }

  private addWithDependencies(
    capabilityId: string,
    resolved: Map<string, CapabilityDefinition>,
    trail: Set<string>,
  ) {
    if (!this.registry.exists(capabilityId)) {
      throw new Error(`Unknown capability ID requested: ${capabilityId}`);
    }

    const capability = this.registry.get(capabilityId)!;

    if (trail.has(capabilityId)) {
      throw new Error(
        `Circular dependency detected: ${Array.from(trail).concat(capabilityId).join(" -> ")}` ,
      );
    }

    if (resolved.has(capabilityId)) {
      return;
    }

    trail.add(capabilityId);

    for (const dependency of capability.dependencies) {
      if (!this.registry.exists(dependency)) {
        throw new Error(
          `Capability ${capability.id} depends on unknown capability ${dependency}.`,
        );
      }

      this.addWithDependencies(dependency, resolved, new Set(trail));
    }

    for (const conflict of capability.conflicts) {
      if (resolved.has(conflict)) {
        throw new Error(
          `Capability conflict detected: ${capability.id} cannot coexist with ${conflict}.`,
        );
      }
    }

    trail.delete(capabilityId);
    resolved.set(capabilityId, capability);
  }
}
