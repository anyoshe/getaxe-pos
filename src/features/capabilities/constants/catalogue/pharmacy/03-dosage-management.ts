import type {
  CapabilityDefinition,
} from "../../../types";


export const DOSAGE_CAPABILITIES: CapabilityDefinition[] = [

  {
    id: "pharmacy.dosage-forms",

    code: "DOSAGE_FORMS",

    name: "Dosage Forms",

    description:
      "Manage medicine dosage forms such as tablets, capsules, syrups and injections.",

    module: "PHARMACY",

    group: "PHARMACY",

    category: "PHARMACY",

    status: "ACTIVE",

    industries: [
      "PHARMACY",
      "CHEMIST",
      "HOSPITAL",
      "CLINIC",
    ],

    defaultEnabled: false,

    dependencies: [
      "pharmacy.medicine-catalogue",
    ],

    conflicts: [],

    schema: [
      "dosage_forms",
      "products",
    ],

    services: [
      "pharmacy",
    ],

    ui: [
      "dosage-forms",
      "medicine-products",
    ],

    workflows: [
      "medicine.dosage-configure",
    ],

    validators: [
      "dosage-form-required",
    ],

    permissions: [
      "pharmacy.dosage.manage",
    ],

    featureFlags: [
      "pharmacy.dosage-forms",
    ],
  },


  {
    id: "pharmacy.medicine-strength",

    code: "MEDICINE_STRENGTH",

    name: "Medicine Strength",

    description:
      "Manage medicine concentration and strength values.",

    module: "PHARMACY",

    group: "PHARMACY",

    category: "PHARMACY",

    status: "ACTIVE",

    industries: [
      "PHARMACY",
      "CHEMIST",
      "HOSPITAL",
    ],

    defaultEnabled: false,

    dependencies: [
      "pharmacy.medicine-catalogue",
    ],

    conflicts: [],

    schema: [
      "medicine_strengths",
      "products",
    ],

    services: [
      "pharmacy",
    ],

    ui: [
      "medicine-strength",
    ],

    workflows: [
      "medicine.strength-configure",
    ],

    validators: [
      "strength-required",
    ],

    permissions: [
      "pharmacy.strength.manage",
    ],

    featureFlags: [
      "pharmacy.medicine-strength",
    ],
  },


  {
    id: "pharmacy.measurement-units",

    code: "MEDICINE_UNITS",

    name: "Medicine Measurement Units",

    description:
      "Manage pharmacy measurement units like mg, ml, tablets and doses.",

    module: "PHARMACY",

    group: "PHARMACY",

    category: "PHARMACY",

    status: "ACTIVE",

    industries: [
      "PHARMACY",
      "CHEMIST",
      "HOSPITAL",
    ],

    defaultEnabled: false,

    dependencies: [
      "pharmacy.medicine-catalogue",
    ],

    conflicts: [],

    schema: [
      "units",
      "products",
    ],

    services: [
      "pharmacy",
      "inventory",
    ],

    ui: [
      "medicine-units",
    ],

    workflows: [
      "medicine.unit-configure",
    ],

    validators: [
      "medicine-unit-required",
    ],

    permissions: [
      "pharmacy.units.manage",
    ],

    featureFlags: [
      "pharmacy.measurement-units",
    ],
  },


  {
    id: "pharmacy.administration-routes",

    code: "ADMINISTRATION_ROUTES",

    name: "Administration Routes",

    description:
      "Define medicine administration routes such as oral, injection and topical.",

    module: "PHARMACY",

    group: "PHARMACY",

    category: "PHARMACY",

    status: "ACTIVE",

    industries: [
      "PHARMACY",
      "HOSPITAL",
      "CLINIC",
    ],

    defaultEnabled: false,

    dependencies: [
      "pharmacy.medicine-catalogue",
    ],

    conflicts: [],

    schema: [
      "administration_routes",
      "products",
    ],

    services: [
      "pharmacy",
      "clinical",
    ],

    ui: [
      "administration-routes",
    ],

    workflows: [
      "prescription.route-select",
    ],

    validators: [
      "route-required",
    ],

    permissions: [
      "pharmacy.routes.manage",
    ],

    featureFlags: [
      "pharmacy.administration-routes",
    ],
  },


  {
    id: "pharmacy.dosage-instructions",

    code: "DOSAGE_INSTRUCTIONS",

    name: "Dosage Instructions",

    description:
      "Store medicine usage instructions including frequency and duration.",

    module: "PHARMACY",

    group: "PHARMACY",

    category: "PHARMACY",

    status: "ACTIVE",

    industries: [
      "PHARMACY",
      "HOSPITAL",
      "CLINIC",
    ],

    defaultEnabled: false,

    dependencies: [
      "pharmacy.dosage-forms",
      "pharmacy.measurement-units",
    ],

    conflicts: [],

    schema: [
      "dosage_instructions",
    ],

    services: [
      "pharmacy",
      "clinical",
    ],

    ui: [
      "dosage-instructions",
    ],

    workflows: [
      "prescription.create",
    ],

    validators: [
      "dosage-instruction-required",
    ],

    permissions: [
      "pharmacy.dosage.manage",
    ],

    featureFlags: [
      "pharmacy.dosage-instructions",
    ],
  },


];