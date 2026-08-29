import type { CapabilityProfile } from "../types";

import {
  AGROVET_PROFILE,
  APPAREL_PROFILE,
  AUTOMOTIVE_PROFILE,
  DEFAULT_PROFILE,
  HARDWARE_PROFILE,
  HOSPITALITY_PROFILE,
  MANUFACTURING_PROFILE,
  OPTICAL_PROFILE,
  PHARMACY_PROFILE,
  SUPERMARKET_PROFILE,
  WHOLESALE_PROFILE,
} from "../profiles";

/**
 * Maps every signup business type to a capability profile.
 * Unlisted keys fall back to DEFAULT_PROFILE (full retail ERP baseline).
 */
export class ProfileLoader {
  private readonly profiles = new Map<string, CapabilityProfile>([
    ["DEFAULT", DEFAULT_PROFILE],
    ["OTHER", DEFAULT_PROFILE],
    ["GENERAL_RETAIL", DEFAULT_PROFILE],

    ["SUPERMARKET", SUPERMARKET_PROFILE],
    ["MINI_MARKET", SUPERMARKET_PROFILE],
    ["BUTCHERY", SUPERMARKET_PROFILE],
    ["BAKERY", MANUFACTURING_PROFILE],

    ["WHOLESALE", WHOLESALE_PROFILE],
    ["DISTRIBUTOR", WHOLESALE_PROFILE],

    ["HARDWARE", HARDWARE_PROFILE],
    ["ELECTRICAL", HARDWARE_PROFILE],
    ["ELECTRONICS", HARDWARE_PROFILE],
    ["PLUMBING", HARDWARE_PROFILE],
    ["BUILDING_MATERIALS", HARDWARE_PROFILE],
    ["PAINT", HARDWARE_PROFILE],

    ["PHARMACY", PHARMACY_PROFILE],
    ["CHEMIST", PHARMACY_PROFILE],
    ["CLINIC", PHARMACY_PROFILE],
    ["HOSPITAL", PHARMACY_PROFILE],
    ["LABORATORY", PHARMACY_PROFILE],
    ["OPTICAL", OPTICAL_PROFILE], // optical uses variants-like attributes + baseline

    ["RESTAURANT", HOSPITALITY_PROFILE],
    ["CAFE", HOSPITALITY_PROFILE],
    ["HOTEL", HOSPITALITY_PROFILE],
    ["BAR", HOSPITALITY_PROFILE],

    ["BOUTIQUE", APPAREL_PROFILE],
    ["CLOTHING", APPAREL_PROFILE],
    ["SHOES", APPAREL_PROFILE],

    ["GARAGE", AUTOMOTIVE_PROFILE],
    ["SPARE_PARTS", AUTOMOTIVE_PROFILE],
    ["TYRE_CENTER", AUTOMOTIVE_PROFILE],

    ["AGROVET", AGROVET_PROFILE],
    ["FARM_SUPPLIES", AGROVET_PROFILE],

    ["BOOKSHOP", DEFAULT_PROFILE],
    ["STATIONERY", DEFAULT_PROFILE],
    ["PRINTING", DEFAULT_PROFILE],

    ["MANUFACTURER", MANUFACTURING_PROFILE],
  ]);

  load(businessType: string): CapabilityProfile {
    return this.profiles.get(businessType.toUpperCase()) ?? DEFAULT_PROFILE;
  }

  all(): CapabilityProfile[] {
    return Array.from(new Set(this.profiles.values()));
  }

  /** All mapped business type keys */
  mappedTypes(): string[] {
    return Array.from(this.profiles.keys()).sort();
  }
}
