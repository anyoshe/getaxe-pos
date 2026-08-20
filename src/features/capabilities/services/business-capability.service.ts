import {
  BusinessCapabilityRepository,
} from "../repositories";

import {
  ProfileLoader,
} from "./profile-loader";

import {
  CapabilityResolver,
} from "./capability-resolver";

import {
  capabilitySyncService,
} from "./capability-sync.service";

import type {
  BusinessType,
} from "@/features/business/constants/business-types";

export class BusinessCapabilityService {

  constructor(
    private readonly profileLoader =
      new ProfileLoader(),

    private readonly resolver =
      new CapabilityResolver(),

    private readonly repository =
      new BusinessCapabilityRepository(),
  ) {}

  /**
   * Provision capabilities for a new business from its type profile.
   * Syncs the code catalogue into the DB first so FK targets exist
   * (e.g. core.attachments must be in `capabilities` before enable).
   */
  async provision(
    businessId: string,
    businessType: BusinessType,
  ) {
    // Ensure every catalogue capability has a row in `capabilities`
    await capabilitySyncService.sync();

    const profile =
      this.profileLoader.load(
        businessType,
      );

    const resolved =
      this.resolver.resolve(
        profile,
      );

    for (const capability of resolved) {
      await this.repository.enable(
        businessId,
        capability.id,
      );
    }
  }

  async listEnabled(
    businessId: string,
  ): Promise<string[]> {
    return this.repository.listEnabled(businessId);
  }

}

export const businessCapabilityService =
  new BusinessCapabilityService();
