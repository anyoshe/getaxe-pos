import type { CapabilityProfile } from "../types";
import {
  CORE_ERP,
  QUOTATIONS,
  SERIALIZED,
  pack,
} from "./shared-sets";

export const AUTOMOTIVE_PROFILE: CapabilityProfile = {
  id: "automotive",
  name: "Automotive / spares",
  description: "Garage, spare parts, tyre centre.",
  businessType: "SPARE_PARTS",
  enabled: pack(CORE_ERP, SERIALIZED, QUOTATIONS, ["industry.automotive"]),
  disabled: [],
};
