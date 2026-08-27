/**
 * Default pharmacy reference catalogues for chemists, pharmacies, clinics.
 * Seeded on business provision (and on-demand for existing businesses).
 * Users can still add missing rows via Pharmacy catalogues / product wizard.
 *
 * Design notes:
 * - Drug categories are therapeutic classes, NOT drug names (Amoxicillin ≠ category).
 * - Generic name / brand live on the product record.
 * - Kenyan controlled-drug schedules belong in a future Pharmacy module —
 *   do not treat "Controlled" as a generic product category here.
 */

export const DEFAULT_DOSAGE_FORMS: { code: string; name: string }[] = [
  { code: "TAB", name: "Tablet" },
  { code: "CAP", name: "Capsule" },
  { code: "SYP", name: "Syrup" },
  { code: "SUS", name: "Suspension" },
  { code: "SOL", name: "Oral Solution" },
  { code: "DRO", name: "Oral Drops" },
  { code: "INJ", name: "Injection" },
  { code: "CRM", name: "Cream" },
  { code: "OIN", name: "Ointment" },
  { code: "GEL", name: "Gel" },
  { code: "LOT", name: "Lotion" },
  { code: "SUP", name: "Suppository" },
  { code: "PES", name: "Pessary" },
  { code: "INH", name: "Inhaler" },
  { code: "NEB", name: "Nebulizer Solution" },
  { code: "SPR", name: "Nasal Spray" },
  { code: "DRP", name: "Eye/Ear Drops" },
  { code: "POW", name: "Powder" },
  { code: "GRN", name: "Granules" },
  { code: "PATCH", name: "Transdermal Patch" },
];

export const DEFAULT_DRUG_CATEGORIES: { code: string; name: string }[] = [
  { code: "ANALGESIC", name: "Analgesic / Painkiller" },
  { code: "ANTIBIOTIC", name: "Antibiotic" },
  { code: "ANTIFUNGAL", name: "Antifungal" },
  { code: "ANTIVIRAL", name: "Antiviral" },
  { code: "ANTIMALARIAL", name: "Antimalarial" },
  { code: "ANTIPARASITIC", name: "Antiparasitic" },
  { code: "ANTHELMINTIC", name: "Anthelmintic / Dewormer" },
  { code: "ANTIINFLAMMATORY", name: "Anti-inflammatory" },
  { code: "ANTIHISTAMINE", name: "Antihistamine" },
  { code: "ANTACID", name: "Antacid" },
  { code: "ANTIULCER", name: "Anti-ulcer" },
  { code: "ANTIDIARRHEAL", name: "Antidiarrheal" },
  { code: "LAXATIVE", name: "Laxative" },
  { code: "ANTISPASMODIC", name: "Antispasmodic" },
  { code: "ANTITUSSIVE", name: "Cough Suppressant" },
  { code: "EXPECTORANT", name: "Expectorant" },
  { code: "BRONCHODILATOR", name: "Bronchodilator" },
  { code: "ANTIHYPERTENSIVE", name: "Antihypertensive" },
  { code: "ANTIDIABETIC", name: "Antidiabetic" },
  { code: "CARDIOVASCULAR", name: "Cardiovascular" },
  { code: "DIURETIC", name: "Diuretic" },
  { code: "ANTICOAGULANT", name: "Anticoagulant" },
  { code: "ANTIPLATELET", name: "Antiplatelet" },
  { code: "CORTICOSTEROID", name: "Corticosteroid" },
  { code: "HORMONAL", name: "Hormonal" },
  { code: "CONTRACEPTIVE", name: "Contraceptive" },
  { code: "VITAMIN", name: "Vitamin" },
  { code: "MINERAL", name: "Mineral Supplement" },
  { code: "ELECTROLYTE", name: "Electrolyte" },
  { code: "DERMATOLOGICAL", name: "Dermatological" },
  { code: "OPHTHALMIC", name: "Ophthalmic" },
  { code: "OTIC", name: "Otic / Ear Medicine" },
  { code: "RESPIRATORY", name: "Respiratory" },
  { code: "PSYCHIATRIC", name: "Psychiatric" },
  { code: "NEUROLOGICAL", name: "Neurological" },
  { code: "MUSCULOSKELETAL", name: "Musculoskeletal" },
  { code: "UROLOGICAL", name: "Urological" },
  { code: "GYNECOLOGICAL", name: "Gynecological" },
  { code: "ANTISEPTIC", name: "Antiseptic" },
  { code: "VACCINE", name: "Vaccine" },
];

/** Strength label is both code and display name for wizard selects. */
export const DEFAULT_DRUG_STRENGTHS: string[] = [
  "1 mg",
  "2 mg",
  "5 mg",
  "10 mg",
  "20 mg",
  "25 mg",
  "40 mg",
  "50 mg",
  "75 mg",
  "100 mg",
  "125 mg",
  "150 mg",
  "200 mg",
  "250 mg",
  "300 mg",
  "400 mg",
  "500 mg",
  "600 mg",
  "750 mg",
  "800 mg",
  "1000 mg",
  "1200 mg",
  "1500 mg",
  "1 g",
  "2 g",
  "5 g",
  "5 mg/5 mL",
  "10 mg/5 mL",
  "20 mg/5 mL",
  "25 mg/5 mL",
  "50 mg/5 mL",
  "100 mg/5 mL",
  "125 mg/5 mL",
  "200 mg/5 mL",
  "250 mg/5 mL",
  "500 mg/5 mL",
  "100 mg/mL",
  "200 mg/mL",
  "500 mg/mL",
  "0.5%",
  "1%",
  "2%",
  "5%",
  "10%",
  "20%",
];

/**
 * Simple dispensing classes for product wizard.
 * Full Kenyan schedule modelling is deferred to the Pharmacy module.
 */
export const DEFAULT_PRESCRIPTION_TYPES: {
  code: string;
  name: string;
  dispensingLevel: "OTC" | "PRESCRIPTION" | "CONTROLLED" | "NARCOTIC";
}[] = [
  {
    code: "OTC",
    name: "Over the Counter",
    dispensingLevel: "OTC",
  },
  {
    code: "POM",
    name: "Prescription Only Medicine",
    dispensingLevel: "PRESCRIPTION",
  },
  {
    code: "P",
    name: "Pharmacy Only",
    dispensingLevel: "PRESCRIPTION",
  },
];

/** Business types that receive pharmacy catalogue seeds. */
export const PHARMACY_CATALOGUE_BUSINESS_TYPES = [
  "PHARMACY",
  "CHEMIST",
  "CLINIC",
  "HOSPITAL",
] as const;

export function shouldSeedPharmacyCatalogues(
  businessType: string | null | undefined,
): boolean {
  if (!businessType) return false;
  return (PHARMACY_CATALOGUE_BUSINESS_TYPES as readonly string[]).includes(
    businessType,
  );
}
