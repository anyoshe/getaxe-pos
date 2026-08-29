import type { CapabilityProfile } from "../types";
import { CORE_ERP, pack } from "./shared-sets";

export const DEFAULT_PROFILE: CapabilityProfile = {
  id: "default",
  name: "Default Business",
  description:
    "Full retail ERP baseline for general shops and any unlisted business type.",
  businessType: "DEFAULT",
  enabled: pack(CORE_ERP),
  disabled: [],
};
