import {
  CAPABILITIES,
  validateCapabilityCatalogue,
} from "../constants";

import type {
  CapabilityDefinition,
} from "../types";

export class CapabilityRegistry {

  private readonly capabilities =
    new Map<string, CapabilityDefinition>();

  private readonly codes =
    new Map<string, CapabilityDefinition>();

  constructor() {
    const issues = validateCapabilityCatalogue(CAPABILITIES);

    if (issues.length > 0) {
      throw new Error(
        `Invalid capability catalogue:\n${issues.join("\n")}`,
      );
    }

    for (const capability of CAPABILITIES) {
      if (this.capabilities.has(capability.id)) {
        throw new Error(`Duplicate capability id in registry: ${capability.id}`);
      }

      if (this.codes.has(capability.code)) {
        throw new Error(`Duplicate capability code in registry: ${capability.code}`);
      }

      this.capabilities.set(
        capability.id,
        capability,
      );

      this.codes.set(
        capability.code,
        capability,
      );
    }
  }

  get(
    id: string,
  ): CapabilityDefinition | undefined {
    return this.capabilities.get(id);
  }

  getByCode(
    code: string,
  ): CapabilityDefinition | undefined {
    return this.codes.get(code);
  }

  all(): CapabilityDefinition[] {
    return Array.from(
      this.capabilities.values(),
    );
  }

  exists(
    id: string,
  ): boolean {
    return this.capabilities.has(id);
  }

}