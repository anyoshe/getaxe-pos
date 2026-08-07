export const CAPABILITY_STATUS = [

    "ACTIVE",

    "BETA",

    "EXPERIMENTAL",

    "DEPRECATED",

] as const;

export type CapabilityStatus =
    (typeof CAPABILITY_STATUS)[number];