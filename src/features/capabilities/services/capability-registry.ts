import {
  CAPABILITIES,
} from "../constants";

import type {
  CapabilityDefinition,
} from "../types";

export class CapabilityRegistry {

  private readonly capabilities =
    new Map<string, CapabilityDefinition>();

  constructor() {

    for (const capability of CAPABILITIES) {

      this.capabilities.set(
        capability.id,
        capability,
      );

    }

  }

  get(
    id: string,
  ): CapabilityDefinition | undefined {

    return this.capabilities.get(id);

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