import type { CapabilityProfile } from "../types";
import { CORE_ERP, MULTI_PRICE, PERISHABLE, pack } from "./shared-sets";

export const SUPERMARKET_PROFILE: CapabilityProfile = {
  id: "supermarket",
  name: "Supermarket",
  description: "Retail supermarket and convenience store with perishables.",
  businessType: "SUPERMARKET",
  enabled: pack(CORE_ERP, PERISHABLE, MULTI_PRICE),
  disabled: ["inventory.serial-numbers"],
};
