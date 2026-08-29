import type { CapabilityProfile } from "../types";
import { CORE_ERP, WHOLESALE_TRADE, pack } from "./shared-sets";

export const WHOLESALE_PROFILE: CapabilityProfile = {
  id: "wholesale",
  name: "Wholesale / distribution",
  description: "Wholesale and distributor trade with credit and quotations.",
  businessType: "WHOLESALE",
  enabled: pack(CORE_ERP, WHOLESALE_TRADE),
  disabled: [],
};
