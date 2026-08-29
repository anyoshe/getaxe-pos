import type { CapabilityProfile } from "../types";
import { CORE_ERP, PERISHABLE, pack } from "./shared-sets";

export const HOSPITALITY_PROFILE: CapabilityProfile = {
  id: "hospitality",
  name: "Hospitality / F&B",
  description: "Restaurants, cafes, bars, hotels.",
  businessType: "RESTAURANT",
  enabled: pack(CORE_ERP, PERISHABLE, ["industry.hospitality"]),
  disabled: ["inventory.serial-numbers"],
};
