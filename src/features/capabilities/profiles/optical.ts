import type { CapabilityProfile } from "../types";
import { CORE_ERP, pack } from "./shared-sets";

export const OPTICAL_PROFILE: CapabilityProfile = {
  id: "optical",
  name: "Optical shop",
  description: "Frames, lenses and optical retail.",
  businessType: "OPTICAL",
  enabled: pack(CORE_ERP, ["industry.optical", "inventory.product-variants"]),
  disabled: [],
};
