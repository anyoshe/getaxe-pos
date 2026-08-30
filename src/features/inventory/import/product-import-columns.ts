/**
 * CSV columns for product catalogue import.
 * Headers are case-insensitive; aliases supported in the parser.
 */
export const PRODUCT_IMPORT_HEADERS = [
  "productType",
  "name",
  "sku",
  "barcode",
  "category",
  "genericName",
  "productBrand",
  "description",
  "packSize",
  "costPrice",
  "sellingPrice",
  "trackInventory",
  "trackBatch",
  "trackExpiry",
  "serialized",
  "allowNegativeStock",
  "minimumStock",
  "reorderLevel",
  "stockUnit",
  "purchaseUnit",
  "salesUnit",
  "dosageForm",
  "drugCategory",
  "drugStrength",
  "prescriptionType",
  "manufacturer",
  "supplier",
  "active",
] as const;

export type ProductImportHeader = (typeof PRODUCT_IMPORT_HEADERS)[number];

export const PRODUCT_IMPORT_TEMPLATE_CSV = [
  PRODUCT_IMPORT_HEADERS.join(","),
  // Example physical
  [
    "physical",
    "Example Widget",
    "SKU-001",
    "6001234567890",
    "General",
    "",
    "Acme",
    "Demo physical product",
    "1",
    "100",
    "150",
    "true",
    "false",
    "false",
    "false",
    "false",
    "5",
    "10",
    "PCS",
    "PCS",
    "PCS",
    "",
    "",
    "",
    "",
    "",
    "",
    "true",
  ].join(","),
  // Example medicine
  [
    "medicine",
    "Amoxicillin 500mg Capsules",
    "AMOX-500-CAP",
    "",
    "Antibiotics",
    "Amoxicillin",
    "Amoxil",
    "",
    "10x10",
    "8",
    "15",
    "true",
    "true",
    "true",
    "false",
    "false",
    "20",
    "50",
    "PCS",
    "BOX",
    "PCS",
    "CAP",
    "ANTIBIOTIC",
    "500 mg",
    "POM",
    "",
    "",
    "true",
  ].join(","),
].join("\n");

export function parseCsv(text: string): {
  headers: string[];
  rows: Record<string, string>[];
} {
  const lines = text
    .replace(/^\uFEFF/, "")
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  if (lines.length === 0) {
    return { headers: [], rows: [] };
  }

  const headers = splitCsvLine(lines[0]).map((h) =>
    normalizeHeader(h),
  );

  const rows: Record<string, string>[] = [];
  for (let i = 1; i < lines.length; i++) {
    const cells = splitCsvLine(lines[i]);
    const row: Record<string, string> = {};
    headers.forEach((h, idx) => {
      row[h] = (cells[idx] ?? "").trim();
    });
    // skip empty name rows
    if (!row.name && !row.productType) continue;
    rows.push(row);
  }
  return { headers, rows };
}

function normalizeHeader(h: string): string {
  const key = h.trim().replace(/^\uFEFF/, "");
  const map: Record<string, string> = {
    producttype: "productType",
    product_type: "productType",
    type: "productType",
    name: "name",
    productname: "name",
    product_name: "name",
    sku: "sku",
    barcode: "barcode",
    category: "category",
    categoryname: "category",
    genericname: "genericName",
    generic_name: "genericName",
    brand: "productBrand",
    productbrand: "productBrand",
    product_brand: "productBrand",
    description: "description",
    packsize: "packSize",
    pack_size: "packSize",
    costprice: "costPrice",
    cost_price: "costPrice",
    cost: "costPrice",
    sellingprice: "sellingPrice",
    selling_price: "sellingPrice",
    price: "sellingPrice",
    trackinventory: "trackInventory",
    track_inventory: "trackInventory",
    trackbatch: "trackBatch",
    track_batch: "trackBatch",
    trackexpiry: "trackExpiry",
    track_expiry: "trackExpiry",
    serialized: "serialized",
    serial: "serialized",
    allownegativestock: "allowNegativeStock",
    allow_negative_stock: "allowNegativeStock",
    minimumstock: "minimumStock",
    minimum_stock: "minimumStock",
    reorderlevel: "reorderLevel",
    reorder_level: "reorderLevel",
    stockunit: "stockUnit",
    stock_unit: "stockUnit",
    purchaseunit: "purchaseUnit",
    purchase_unit: "purchaseUnit",
    salesunit: "salesUnit",
    sales_unit: "salesUnit",
    dosageform: "dosageForm",
    dosage_form: "dosageForm",
    drugcategory: "drugCategory",
    drug_category: "drugCategory",
    drugstrength: "drugStrength",
    drug_strength: "drugStrength",
    strength: "drugStrength",
    prescriptiontype: "prescriptionType",
    prescription_type: "prescriptionType",
    rx: "prescriptionType",
    manufacturer: "manufacturer",
    supplier: "supplier",
    active: "active",
  };
  const compact = key.toLowerCase().replace(/\s+/g, "");
  return map[compact] ?? map[key.toLowerCase().replace(/\s+/g, "_")] ?? key;
}

function splitCsvLine(line: string): string[] {
  const out: string[] = [];
  let cur = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        cur += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }
    if (ch === "," && !inQuotes) {
      out.push(cur);
      cur = "";
      continue;
    }
    cur += ch;
  }
  out.push(cur);
  return out;
}
