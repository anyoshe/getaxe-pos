import type { CapabilityProfile } from "../types";
import { CORE_ERP, PERISHABLE, pack } from "./shared-sets";

export const MANUFACTURING_PROFILE: CapabilityProfile = {
  id: "manufacturing",
  name: "Light manufacturing",
  description: "Manufacturers and production-oriented bakeries.",
  businessType: "MANUFACTURER",
  enabled: pack(CORE_ERP, PERISHABLE, ["industry.manufacturing-light"]),
  disabled: [],
};
