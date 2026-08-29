import type { CapabilityProfile } from "../types";
import { CORE_ERP, MULTI_PRICE, pack } from "./shared-sets";

export const APPAREL_PROFILE: CapabilityProfile = {
  id: "apparel",
  name: "Apparel retail",
  description: "Clothing, boutique, shoes.",
  businessType: "CLOTHING",
  enabled: pack(CORE_ERP, MULTI_PRICE, [
    "inventory.product-variants",
    "industry.apparel",
  ]),
  disabled: [],
};
