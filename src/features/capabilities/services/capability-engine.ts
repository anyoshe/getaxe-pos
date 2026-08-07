import type {
  CapabilityDefinition,
  CapabilityEngine,
  CapabilityProfile,
} from "../types";

import {
  CapabilityRegistry,
} from "./capability-registry";

import {
  CapabilityProfileService,
} from "./capability-profile.service";

export class DefaultCapabilityEngine
  implements CapabilityEngine {

  readonly capabilities: CapabilityDefinition[];

  constructor(
    private readonly registry =
      new CapabilityRegistry(),

    private readonly profile:
      CapabilityProfileService,
  ) {

    this.capabilities =
      this.registry.all();

  }

  has(
    capabilityId: string,
  ): boolean {

    return this.profile
      .isEnabled(capabilityId);

  }

  get(
    capabilityId: string,
  ): CapabilityDefinition | undefined {

    return this.registry.get(
      capabilityId,
    );

  }

  enabled(): CapabilityDefinition[] {

    return this.capabilities.filter(
      capability =>
        this.profile.isEnabled(
          capability.id,
        ),
    );

  }

  disabled(): CapabilityDefinition[] {

    return this.capabilities.filter(
      capability =>
        this.profile.isDisabled(
          capability.id,
        ),
    );

  }

}