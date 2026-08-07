import type {
  CapabilityProfile,
} from "../types";

export class CapabilityProfileService {

  constructor(
    private readonly profile: CapabilityProfile,
  ) {}

  getProfile(): CapabilityProfile {

    return this.profile;

  }

  getBusinessType(): string {

    return this.profile.businessType;

  }

  enabled(): string[] {

    return this.profile.enabled;

  }

  disabled(): string[] {

    return this.profile.disabled;

  }

  isEnabled(
    capabilityId: string,
  ): boolean {

    return this.profile.enabled.includes(
      capabilityId,
    );

  }

  isDisabled(
    capabilityId: string,
  ): boolean {

    return this.profile.disabled.includes(
      capabilityId,
    );

  }

}