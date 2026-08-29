import type { CapabilityProfile } from "../types";
import { CORE_ERP, PERISHABLE, pack } from "./shared-sets";

export const AGROVET_PROFILE: CapabilityProfile = {
  id: "agrovet",
  name: "Agrovet / farm supplies",
  description: "Agro chemicals and farm inputs with batch/expiry.",
  businessType: "AGROVET",
  enabled: pack(CORE_ERP, PERISHABLE, ["industry.agrovet"]),
  disabled: [],
};
