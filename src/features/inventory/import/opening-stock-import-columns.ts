export const OPENING_STOCK_HEADERS = [
  "sku",
  "barcode",
  "warehouse",
  "quantity",
  "unit",
  "unitCost",
  "batchNumber",
  "manufactureDate",
  "expiryDate",
  "serialNumbers",
  "reference",
  "notes",
] as const;

export const OPENING_STOCK_TEMPLATE_CSV = [
  OPENING_STOCK_HEADERS.join(","),
  [
    "AMOX-500-CAP",
    "",
    "MAIN",
    "100",
    "PCS",
    "8",
    "LOT-2026-001",
    "2025-06-01",
    "2027-06-01",
    "",
    "OPENING",
    "Opening balance",
  ].join(","),
  [
    "SKU-001",
    "6001234567890",
    "MAIN",
    "50",
    "PCS",
    "100",
    "",
    "",
    "",
    "",
    "OPENING",
    "",
  ].join(","),
  // Serialized example: pipe-separated serials; quantity should match count
  [
    "SERIAL-ITEM-1",
    "",
    "MAIN",
    "2",
    "PCS",
    "5000",
    "",
    "",
    "",
    "SN-001|SN-002",
    "OPENING",
    "Serialized opening",
  ].join(","),
].join("\n");

export function parseOpeningStockCsv(text: string): {
  headers: string[];
  rows: Record<string, string>[];
} {
  const lines = text
    .replace(/^\uFEFF/, "")
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  if (lines.length === 0) return { headers: [], rows: [] };

  const headers = splitCsvLine(lines[0]).map(normalizeHeader);
  const rows: Record<string, string>[] = [];
  for (let i = 1; i < lines.length; i++) {
    const cells = splitCsvLine(lines[i]);
    const row: Record<string, string> = {};
    headers.forEach((h, idx) => {
      row[h] = (cells[idx] ?? "").trim();
    });
    if (!row.sku && !row.barcode && !row.quantity) continue;
    rows.push(row);
  }
  return { headers, rows };
}

function normalizeHeader(h: string): string {
  const compact = h
    .trim()
    .replace(/^\uFEFF/, "")
    .toLowerCase()
    .replace(/[\s_]+/g, "");
  const map: Record<string, string> = {
    sku: "sku",
    barcode: "barcode",
    warehouse: "warehouse",
    warehousecode: "warehouse",
    warehouse_code: "warehouse",
    qty: "quantity",
    quantity: "quantity",
    unit: "unit",
    unitcode: "unit",
    unitcost: "unitCost",
    cost: "unitCost",
    batch: "batchNumber",
    batchnumber: "batchNumber",
    lot: "batchNumber",
    manufacturedate: "manufactureDate",
    mfg: "manufactureDate",
    mfgdate: "manufactureDate",
    expirydate: "expiryDate",
    expiry: "expiryDate",
    exp: "expiryDate",
    serialnumbers: "serialNumbers",
    serials: "serialNumbers",
    serial: "serialNumbers",
    reference: "reference",
    ref: "reference",
    notes: "notes",
    note: "notes",
  };
  return map[compact] ?? h.trim();
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
