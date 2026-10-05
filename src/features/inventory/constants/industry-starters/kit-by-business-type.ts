import type { BusinessType } from "@/features/business/constants/business-types";

import type { IndustryStarterKitId } from "./default-industry-starters";

/** Pharmacy / clinical verticals — use medicine starter kit (pharmacy catalogues), not industry kits. */
export const PHARMACY_BUSINESS_TYPES: readonly string[] = [
  "PHARMACY",
  "CHEMIST",
  "CLINIC",
  "HOSPITAL",
  "LABORATORY",
  "OPTICAL",
] as const;

export function isPharmacyBusinessType(
  businessType: string | null | undefined,
): boolean {
  if (!businessType) return false;
  return PHARMACY_BUSINESS_TYPES.includes(businessType);
}

/**
 * Which industry starter kits a business should see by setup type.
 * - Specific verticals → only matching kit(s)
 * - OTHER / retail / unknown → all industry kits
 * - Pharmacy verticals → no industry kits (medicine starters live under Pharmacy catalogues)
 */
export function resolveIndustryKitsForBusinessType(
  businessType: string | null | undefined,
): IndustryStarterKitId[] | "all" | "pharmacy-only" {
  if (!businessType) return "all";
  if (isPharmacyBusinessType(businessType)) return "pharmacy-only";

  const t = businessType as BusinessType | string;

  switch (t) {
    case "HARDWARE":
    case "ELECTRICAL":
    case "ELECTRONICS":
    case "PLUMBING":
    case "BUILDING_MATERIALS":
    case "PAINT":
      return ["hardware"];

    case "AGROVET":
    case "FARM_SUPPLIES":
      return ["agrovet"];

    case "SPARE_PARTS":
    case "GARAGE":
    case "TYRE_CENTER":
      // Motorbike + auto share spare-parts style shops
      return ["motorbike", "auto"];

    case "OTHER":
    case "GENERAL_RETAIL":
    case "SUPERMARKET":
    case "MINI_MARKET":
    case "WHOLESALE":
    case "DISTRIBUTOR":
    case "MANUFACTURER":
    default:
      return "all";
  }
}

export function filterKitsList(
  allowed: IndustryStarterKitId[] | "all" | "pharmacy-only",
): IndustryStarterKitId[] {
  const all: IndustryStarterKitId[] = [
    "hardware",
    "agrovet",
    "motorbike",
    "auto",
  ];
  if (allowed === "pharmacy-only") return [];
  if (allowed === "all") return all;
  return allowed;
}
