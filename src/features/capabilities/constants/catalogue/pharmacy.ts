import {
  PHARMACY_CORE_CAPABILITIES,
} from "./pharmacy/01-pharmacy-core";

import {
  DRUG_CLASSIFICATION_CAPABILITIES,
} from "./pharmacy/02-drug-classification";

import {
  DOSAGE_CAPABILITIES,
} from "./pharmacy/03-dosage-management";

import {
  PRESCRIPTION_CAPABILITIES,
} from "./pharmacy/04-prescriptions";

import {
  DISPENSING_CAPABILITIES,
} from "./pharmacy/05-dispensing";

import {
  PHARMACY_CONTROL_CAPABILITIES,
} from "./pharmacy/06-pharmacy-controls";


export const PHARMACY_CAPABILITIES = [

  ...PHARMACY_CORE_CAPABILITIES,

  ...DRUG_CLASSIFICATION_CAPABILITIES,

  ...DOSAGE_CAPABILITIES,

  ...PRESCRIPTION_CAPABILITIES,

  ...DISPENSING_CAPABILITIES,

  ...PHARMACY_CONTROL_CAPABILITIES,

];