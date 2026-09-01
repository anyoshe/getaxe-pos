/**
 * Client-side CSV / Excel helpers for import & template download.
 */
import * as XLSX from "xlsx";

export type SpreadsheetRow = Record<string, string>;

function cellToString(value: unknown): string {
  if (value === null || value === undefined) return "";
  if (value instanceof Date) {
    return value.toISOString().slice(0, 10);
  }
  return String(value).trim();
}

/** Normalize spreadsheet headers to app field keys (CSV aliases). */
export function normalizeSpreadsheetHeader(h: string): string {
  const compact = h
    .trim()
    .replace(/^\uFEFF/, "")
    .toLowerCase()
    .replace(/[\s\-]+/g, "_");
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
    prescriptiontype: "prescriptionType",
    prescription_type: "prescriptionType",
    manufacturer: "manufacturer",
    supplier: "supplier",
    active: "active",
    warehouse: "warehouse",
    warehousecode: "warehouse",
    warehouse_code: "warehouse",
    qty: "quantity",
    quantity: "quantity",
    unit: "unit",
    unitcode: "unit",
    unit_code: "unit",
    unitcost: "unitCost",
    unit_cost: "unitCost",
    batch: "batchNumber",
    batchnumber: "batchNumber",
    batch_number: "batchNumber",
    lot: "batchNumber",
    manufacturedate: "manufactureDate",
    manufacture_date: "manufactureDate",
    mfg: "manufactureDate",
    mfgdate: "manufactureDate",
    expirydate: "expiryDate",
    expiry_date: "expiryDate",
    expiry: "expiryDate",
    exp: "expiryDate",
    serialnumbers: "serialNumbers",
    serial_numbers: "serialNumbers",
    serials: "serialNumbers",
    reference: "reference",
    ref: "reference",
    notes: "notes",
  };
  const noUnderscore = compact.replace(/_/g, "");
  return map[compact] ?? map[noUnderscore] ?? h.trim();
}

function sheetToRows(
  sheet: XLSX.WorkSheet,
): { rows: SpreadsheetRow[]; headers: string[] } {
  const json = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, {
    defval: "",
    raw: false,
  });
  if (json.length === 0) return { rows: [], headers: [] };

  const rawHeaders = Object.keys(json[0] ?? {});
  const headers = rawHeaders.map(normalizeSpreadsheetHeader);

  const rows: SpreadsheetRow[] = json.map((row) => {
    const out: SpreadsheetRow = {};
    rawHeaders.forEach((raw, i) => {
      const key = headers[i] ?? normalizeSpreadsheetHeader(raw);
      out[key] = cellToString(row[raw]);
    });
    return out;
  });

  return { rows, headers };
}

/** Parse .csv / .xlsx / .xls into normalized string row objects. */
export async function parseSpreadsheetFile(
  file: File,
): Promise<{ rows: SpreadsheetRow[]; headers: string[] }> {
  const name = file.name.toLowerCase();
  const isExcel =
    name.endsWith(".xlsx") ||
    name.endsWith(".xls") ||
    file.type.includes("spreadsheet") ||
    file.type.includes("excel");

  if (isExcel) {
    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer, { type: "array", cellDates: true });
    const sheetName = workbook.SheetNames[0];
    if (!sheetName) return { rows: [], headers: [] };
    return sheetToRows(workbook.Sheets[sheetName]);
  }

  const text = await file.text();
  const workbook = XLSX.read(text, { type: "string" });
  const sheetName = workbook.SheetNames[0];
  if (!sheetName) return { rows: [], headers: [] };
  return sheetToRows(workbook.Sheets[sheetName]);
}

export function downloadCsv(filename: string, csvContent: string) {
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename.endsWith(".csv") ? filename : `${filename}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export function downloadXlsx(
  filename: string,
  sheetName: string,
  rows: Array<Record<string, string | number | boolean | null | undefined>>,
) {
  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName.slice(0, 31));
  XLSX.writeFile(
    workbook,
    filename.endsWith(".xlsx") ? filename : `${filename}.xlsx`,
  );
}

export function downloadXlsxFromCsvText(
  filename: string,
  sheetName: string,
  csvText: string,
) {
  const workbook = XLSX.read(csvText, { type: "string" });
  const first = workbook.SheetNames[0];
  if (!first) return;
  const sheet = workbook.Sheets[first];
  const out = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(out, sheet, sheetName.slice(0, 31));
  XLSX.writeFile(
    out,
    filename.endsWith(".xlsx") ? filename : `${filename}.xlsx`,
  );
}

export const SPREADSHEET_ACCEPT =
  ".csv,.xlsx,.xls,text/csv,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
