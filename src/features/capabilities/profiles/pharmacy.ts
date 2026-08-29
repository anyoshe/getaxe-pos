import type { CapabilityProfile } from "../types";
import { CORE_ERP, PHARMA_PACK, pack } from "./shared-sets";

export const PHARMACY_PROFILE: CapabilityProfile = {
  id: "pharmacy",
  name: "Retail Pharmacy",
  description: "Pharmacy / chemist with dispensing and catalogue.",
  businessType: "PHARMACY",
  enabled: pack(CORE_ERP, PHARMA_PACK),
  disabled: ["inventory.serial-numbers"],
};
