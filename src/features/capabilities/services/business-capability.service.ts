import {
  BusinessCapabilityRepository,
} from "../repositories";

import {
  ProfileLoader,
} from "./profile-loader";

import {
  CapabilityResolver,
} from "./capability-resolver";

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

 async provision(
businessId: string,
businessType: BusinessType,
) {

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