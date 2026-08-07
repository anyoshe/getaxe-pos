import type {
  CapabilityProfile,
} from "../types";

import {
  DEFAULT_PROFILE,
  HARDWARE_PROFILE,
  PHARMACY_PROFILE,
  SUPERMARKET_PROFILE,
} from "../profiles";

export class ProfileLoader {

  private readonly profiles =
    new Map<string, CapabilityProfile>([
      ["DEFAULT", DEFAULT_PROFILE],
      ["HARDWARE", HARDWARE_PROFILE],
      ["SUPERMARKET", SUPERMARKET_PROFILE],
      ["PHARMACY", PHARMACY_PROFILE],
    ]);

  load(
    businessType: string,
  ): CapabilityProfile {

    return (
      this.profiles.get(
        businessType.toUpperCase(),
      ) ??
      DEFAULT_PROFILE
    );

  }

  all(): CapabilityProfile[] {

    return Array.from(
      this.profiles.values(),
    );

  }

}