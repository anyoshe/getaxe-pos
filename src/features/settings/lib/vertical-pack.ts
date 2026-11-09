/**
 * Canonical vertical packs for one-click go-live bootstrap.
 * Maps the simplified go-live vertical → businessType + starter behaviour.
 */

import type { BusinessType } from "@/features/business/constants/business-types";
import type { IndustryStarterKitId } from "@/features/inventory/constants/industry-starters/default-industry-starters";
import type { GoLiveVertical } from "./go-live-day";

export type VerticalPack = {
  vertical: GoLiveVertical;
  /** Primary business_type written to businesses */
  businessType: BusinessType;
  label: string;
  blurb: string;
  /** Industry starter kits to load (empty → pharmacy medicine starters) */
  industryKits: IndustryStarterKitId[];
  usePharmacyStarters: boolean;
};

export const VERTICAL_PACKS: VerticalPack[] = [
  {
    vertical: "pharmacy",
    businessType: "PHARMACY",
    label: "Pharmacy / Chemist",
    blurb: "Medicines, batches, expiry, dispensing-ready catalogue",
    industryKits: [],
    usePharmacyStarters: true,
  },
  {
    vertical: "hardware",
    businessType: "HARDWARE",
    label: "Hardware",
    blurb: "Building materials, tools, multi-unit (pcs / m / kg)",
    industryKits: ["hardware"],
    usePharmacyStarters: false,
  },
  {
    vertical: "agrovet",
    businessType: "AGROVET",
    label: "Agrovet",
    blurb: "Farm inputs, vet lines, bag/kg units, seasonal stock",
    industryKits: ["agrovet"],
    usePharmacyStarters: false,
  },
  {
    vertical: "spares",
    businessType: "SPARE_PARTS",
    label: "Spares / Garage",
    blurb: "Motorbike + auto parts, serials for complete units",
    industryKits: ["motorbike", "auto"],
    usePharmacyStarters: false,
  },
  {
    vertical: "general",
    businessType: "GENERAL_RETAIL",
    label: "General retail",
    blurb: "Shop / mini-market — pick starters or import your list",
    industryKits: ["hardware", "agrovet", "motorbike", "auto"],
    usePharmacyStarters: false,
  },
];

export function packForVertical(vertical: GoLiveVertical): VerticalPack {
  return (
    VERTICAL_PACKS.find((p) => p.vertical === vertical) ?? VERTICAL_PACKS[4]!
  );
}

export function packForBusinessType(
  businessType: string | null | undefined,
): VerticalPack {
  const t = (businessType ?? "").toUpperCase();
  if (
    ["PHARMACY", "CHEMIST", "CLINIC", "HOSPITAL", "LABORATORY", "OPTICAL"].includes(
      t,
    )
  ) {
    return packForVertical("pharmacy");
  }
  if (
    [
      "HARDWARE",
      "ELECTRICAL",
      "ELECTRONICS",
      "PLUMBING",
      "BUILDING_MATERIALS",
      "PAINT",
    ].includes(t)
  ) {
    return packForVertical("hardware");
  }
  if (["AGROVET", "FARM_SUPPLIES"].includes(t)) {
    return packForVertical("agrovet");
  }
  if (["SPARE_PARTS", "GARAGE", "TYRE_CENTER", "AUTO"].includes(t)) {
    return packForVertical("spares");
  }
  return packForVertical("general");
}
