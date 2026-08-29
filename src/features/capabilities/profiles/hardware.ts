import type { CapabilityProfile } from "../types";
import {
  CORE_ERP,
  MULTI_PRICE,
  QUOTATIONS,
  SERIALIZED,
  pack,
} from "./shared-sets";

export const HARDWARE_PROFILE: CapabilityProfile = {
  id: "hardware",
  name: "Hardware Store",
  description: "Retail and wholesale hardware merchants.",
  businessType: "HARDWARE",
  enabled: pack(CORE_ERP, SERIALIZED, QUOTATIONS, MULTI_PRICE),
  disabled: ["inventory.expiry-control"],
};
