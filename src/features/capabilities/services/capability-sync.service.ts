import { CapabilityRegistry } from "./capability-registry";

import { CapabilityRepository } from "../repositories";

export class CapabilitySyncService {
  constructor(
    private readonly registry = new CapabilityRegistry(),

    private readonly repository = new CapabilityRepository(),
  ) {}

  async sync() {
    const catalogue = this.registry.all();

    const catalogueIds = new Set(catalogue.map((capability) => capability.id));

    //
    // Create / Update
    //

    for (const capability of catalogue) {
      let existing = await this.repository.findByCapabilityId(capability.id);

      if (!existing) {
        existing = await this.repository.findByCode(capability.code);
      }

      if (!existing) {
        await this.repository.create(capability);
      } else {
        await this.repository.update(capability);
      }
    }

    //
    // Remove deleted capabilities
    //

    const databaseIds = await this.repository.allCapabilityIds();

    for (const capabilityId of databaseIds) {
      if (!catalogueIds.has(capabilityId)) {
        await this.repository.deleteByCapabilityId(capabilityId);
      }
    }
  }
}

export const capabilitySyncService = new CapabilitySyncService();
