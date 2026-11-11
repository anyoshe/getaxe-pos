/**
 * Phase D — paste list → product draft → bulk create (OCR later).
 * Parses simple lines; create uses existing createProductsBatchAction.
 */

export type ProductPasteDraftLine = {
  name: string;
  sku: string | null;
  barcode: string | null;
  costPrice: number | null;
  sellingPrice: number | null;
  productType: "physical" | "service" | "medicine" | "raw-material" | "finished-product";
};

export type ProductPasteDraft = {
  lines: ProductPasteDraftLine[];
  skipped: string[];
  categoryId: string | null;
  categoryName: string | null;
};

function money(n: number) {
  return `KES ${Math.round(n).toLocaleString("en-KE")}`;
}

function parseNumber(raw: string): number | null {
  const s = raw.replace(/,/g, "").replace(/kes/gi, "").trim();
  if (!s) return null;
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}

/** Split a line by tab, pipe, or comma (not inside simple names without commas preferred). */
function splitFields(line: string): string[] {
  if (line.includes("\t")) return line.split("\t").map((s) => s.trim());
  if (line.includes("|")) return line.split("|").map((s) => s.trim());
  // CSV-ish: split on commas
  if (line.includes(",")) {
    return line.split(",").map((s) => s.trim());
  }
  return [line.trim()];
}

function looksLikeHeader(fields: string[]): boolean {
  const joined = fields.join(" ").toLowerCase();
  return (
    /^(name|product|item)/.test(fields[0]?.toLowerCase() ?? "") ||
    (joined.includes("name") && (joined.includes("price") || joined.includes("cost") || joined.includes("sku")))
  );
}

/**
 * Parse pasted catalogue text into draft lines.
 * Supported shapes (one product per line):
 * - Name
 * - Name, cost, sell
 * - Name | cost | sell
 * - SKU, Name, cost, sell
 * - Name, SKU, cost, sell  (if second field is non-numeric-looking code)
 */
export function parseProductPasteText(text: string): {
  lines: ProductPasteDraftLine[];
  skipped: string[];
} {
  const lines: ProductPasteDraftLine[] = [];
  const skipped: string[] = [];
  const rawLines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  let start = 0;
  if (rawLines.length && looksLikeHeader(splitFields(rawLines[0]))) {
    start = 1;
  }

  for (let i = start; i < rawLines.length; i++) {
    const line = rawLines[i];
    // strip leading list markers
    const cleaned = line.replace(/^[-*•\d.)\s]+/, "").trim();
    if (cleaned.length < 2) {
      skipped.push(line);
      continue;
    }

    const fields = splitFields(cleaned).filter((f) => f.length > 0);
    if (fields.length === 0) {
      skipped.push(line);
      continue;
    }

    let name = "";
    let sku: string | null = null;
    let costPrice: number | null = null;
    let sellingPrice: number | null = null;

    if (fields.length === 1) {
      name = fields[0];
    } else if (fields.length === 2) {
      name = fields[0];
      const n = parseNumber(fields[1]);
      if (n != null) sellingPrice = n;
      else sku = fields[1];
    } else if (fields.length === 3) {
      name = fields[0];
      const a = parseNumber(fields[1]);
      const b = parseNumber(fields[2]);
      if (a != null && b != null) {
        costPrice = a;
        sellingPrice = b;
      } else if (a != null) {
        sellingPrice = a;
        sku = fields[2];
      } else {
        sku = fields[1];
        sellingPrice = b;
      }
    } else {
      // 4+: try SKU, Name, cost, sell OR Name, sku, cost, sell
      const f0n = parseNumber(fields[0]);
      if (f0n == null && parseNumber(fields[1]) == null) {
        // SKU, Name, ...
        sku = fields[0];
        name = fields[1];
        costPrice = parseNumber(fields[2]);
        sellingPrice = parseNumber(fields[3]);
      } else {
        name = fields[0];
        const maybeSku = fields[1];
        if (parseNumber(maybeSku) == null) {
          sku = maybeSku;
          costPrice = parseNumber(fields[2]);
          sellingPrice = parseNumber(fields[3]);
        } else {
          costPrice = parseNumber(fields[1]);
          sellingPrice = parseNumber(fields[2]);
        }
      }
    }

    name = name.trim();
    if (name.length < 2) {
      skipped.push(line);
      continue;
    }

    lines.push({
      name: name.slice(0, 200),
      sku: sku ? sku.slice(0, 64) : null,
      barcode: null,
      costPrice,
      sellingPrice,
      productType: "physical",
    });
  }

  // de-dupe by name+sku within paste
  const seen = new Set<string>();
  const unique: ProductPasteDraftLine[] = [];
  for (const l of lines) {
    const key = `${l.name.toLowerCase()}|${(l.sku ?? "").toLowerCase()}`;
    if (seen.has(key)) continue;
    seen.add(key);
    unique.push(l);
  }

  return { lines: unique.slice(0, 100), skipped };
}

export function parseProductPasteIntent(question: string): string | null {
  const q = question.trim();
  const lower = q.toLowerCase();

  // Explicit multi-line paste after a cue
  const cue =
    /(?:^|\n)\s*(?:paste\s+products?|import\s+products?|add\s+these\s+products?|create\s+products?\s+from\s+(?:this\s+)?(?:list|paste)|products?\s*:)\s*\n([\s\S]+)/i.exec(
      q,
    );
  if (cue?.[1]?.trim()) return cue[1].trim();

  // Multi-line body that looks like a list (3+ product-like lines)
  const bodyLines = q.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  if (bodyLines.length >= 3) {
    const productish = bodyLines.filter((l) => {
      if (/^(help|how|what|why|daily|weekly|setup|draft\s*po)/i.test(l)) return false;
      return l.length >= 2 && !l.endsWith("?");
    });
    if (productish.length >= 3) return productish.join("\n");
  }

  // Single instruction without body
  if (
    /^(paste|import)\s+products?/.test(lower) ||
    /how\s+do\s+i\s+(paste|import)\s+products?/.test(lower)
  ) {
    return ""; // signal: show instructions only
  }

  return null;
}

export function formatProductPasteDraftMessage(draft: ProductPasteDraft): string {
  if (!draft.categoryId) {
    return (
      "**Product paste**\n\n" +
      "You need at least one **category** before products can be created. " +
      "Add a category under Inventory → Categories (or finish go-live), then paste your list again.\n\n" +
      "Format (one per line):\n" +
      "`Name, cost, sell price`\n" +
      "Example: `Paracetamol 500mg, 30, 50`"
    );
  }

  if (draft.lines.length === 0) {
    return (
      "**Product paste**\n\n" +
      "Paste a list in the chat, for example:\n\n" +
      "```\n" +
      "paste products:\n" +
      "Paracetamol 500mg, 30, 50\n" +
      "Amoxicillin 250mg, 45, 80\n" +
      "Surgical spirit 100ml, 120, 180\n" +
      "```\n\n" +
      "Or: `Name` only · `Name, sell` · `SKU, Name, cost, sell`.\n" +
      `Default category: **${draft.categoryName ?? "first category"}**. ` +
      "OCR from photos can come later — text paste works now."
    );
  }

  const lines: string[] = [
    "**Product draft from paste**",
    "",
    `${draft.lines.length} product(s) ready · category **${draft.categoryName}**.`,
    "",
  ];

  for (const l of draft.lines.slice(0, 25)) {
    lines.push(
      `- **${l.name}**` +
        (l.sku ? ` · SKU ${l.sku}` : "") +
        (l.costPrice != null ? ` · cost ${money(l.costPrice)}` : "") +
        (l.sellingPrice != null ? ` · sell ${money(l.sellingPrice)}` : ""),
    );
  }
  if (draft.lines.length > 25) {
    lines.push(`- …and ${draft.lines.length - 25} more`);
  }
  if (draft.skipped.length) {
    lines.push("");
    lines.push(`_Skipped ${draft.skipped.length} unclear line(s)._`);
  }
  lines.push("");
  lines.push(
    "Tap **Create these products** to save them (same rules as Inventory → Products). " +
      "Stock stays zero until you post opening stock or receive a PO.",
  );
  return lines.join("\n");
}

export function productPasteDraftActions(draft: ProductPasteDraft): {
  label: string;
  href?: string;
  createProductsFromPaste?: boolean;
}[] {
  const actions: {
    label: string;
    href?: string;
    createProductsFromPaste?: boolean;
  }[] = [];

  if (draft.lines.length > 0 && draft.categoryId) {
    actions.push({
      label: "Create these products",
      createProductsFromPaste: true,
    });
  }
  if (!draft.categoryId) {
    actions.push({ label: "Categories", href: "/inventory/categories" });
    actions.push({ label: "Go live", href: "/settings/go-live" });
  } else {
    actions.push({ label: "Products", href: "/inventory/products" });
    actions.push({ label: "Opening stock", href: "/inventory/stock/receive" });
  }
  return actions;
}

/** Build payload rows for createProductsBatchAction */
export function toBatchCreateItems(
  lines: ProductPasteDraftLine[],
  categoryId: string,
): Record<string, unknown>[] {
  return lines.map((l) => ({
    productType: l.productType,
    categoryId,
    supplierId: null,
    manufacturerId: null,
    drugCategoryId: null,
    dosageFormId: null,
    drugStrengthId: null,
    prescriptionTypeId: null,
    purchaseUnitId: null,
    salesUnitId: null,
    stockUnitId: null,
    incomeAccountId: null,
    expenseAccountId: null,
    inventoryAccountId: null,
    taxRateId: null,
    name: l.name,
    genericName: null,
    productBrand: null,
    description: null,
    sku: l.sku,
    barcode: l.barcode,
    packSize: null,
    costPrice: l.costPrice,
    sellingPrice: l.sellingPrice,
    trackInventory: true,
    trackBatch: false,
    trackExpiry: false,
    serialized: false,
    allowNegativeStock: false,
    minimumStock: 0,
    reorderLevel: 0,
    active: true,
  }));
}
