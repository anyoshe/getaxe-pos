"use server";

import { requireAuthorizedUser } from "@/lib/auth/authorize";
import { BusinessCapabilityRepository } from "@/features/capabilities/repositories";
import { createProductSchema } from "../schemas/products";
import { productRuleResolver } from "../services/product-rule-resolver";
import { productContextService } from "../services/product-context.service";

function parseBool(v: string | undefined, defaultValue: boolean): boolean {
  if (v === undefined || v === null || String(v).trim() === "") {
    return defaultValue;
  }
  const s = String(v).trim().toLowerCase();
  if (["1", "true", "yes", "y", "on"].includes(s)) return true;
  if (["0", "false", "no", "n", "off"].includes(s)) return false;
  return defaultValue;
}

function parseNum(v: string | undefined, fallback: number): number {
  if (v === undefined || v === null || String(v).trim() === "") return fallback;
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

function parseNumNull(v: string | undefined): number | null {
  if (v === undefined || v === null || String(v).trim() === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function norm(s: string | undefined | null): string {
  return (s ?? "").trim().toLowerCase();
}

function matchByCodeOrName<T extends { id: string; code?: string | null; name?: string | null }>(
  list: T[],
  value: string,
): T | undefined {
  const n = norm(value);
  if (!n) return undefined;
  return (
    list.find((x) => norm(x.code ?? "") === n) ||
    list.find((x) => norm(x.name ?? "") === n) ||
    list.find((x) => norm(x.name ?? "").includes(n) || n.includes(norm(x.name ?? "")))
  );
}

export type ImportRowResult = {
  index: number;
  ok: boolean;
  errors: string[];
  /** Payload ready for createProductsBatchAction when ok */
  payload?: Record<string, unknown>;
  preview?: {
    name: string;
    productType: string;
    sku: string;
    category: string;
  };
};

export async function validateProductImportAction(
  rows: Record<string, string>[],
) {
  const user = await requireAuthorizedUser("products.create");

  if (!Array.isArray(rows) || rows.length === 0) {
    return {
      success: false as const,
      message: "No rows to validate.",
      results: [] as ImportRowResult[],
    };
  }
  if (rows.length > 200) {
    return {
      success: false as const,
      message: "Maximum 200 rows per upload. Split the file and import in batches.",
      results: [],
    };
  }

  const ctx = await productContextService.getContext(user.businessId);
  const businessCapabilities =
    await new BusinessCapabilityRepository().listEnabled(user.businessId);

  const categories = ctx.categories ?? [];
  const units = ctx.units ?? [];
  const dosageForms = ctx.dosageForms ?? [];
  const drugCategories = ctx.drugCategories ?? [];
  const drugStrengths = ctx.drugStrengths ?? [];
  const prescriptionTypes = ctx.prescriptionTypes ?? [];
  const manufacturers = ctx.manufacturers ?? [];
  const suppliers = ctx.suppliers ?? [];

  const results: ImportRowResult[] = [];

  for (let index = 0; index < rows.length; index++) {
    const row = rows[index] ?? {};
    const errors: string[] = [];

    const productTypeRaw = (row.productType || "physical").trim().toLowerCase();
    const productTypeMap: Record<string, string> = {
      physical: "physical",
      service: "service",
      medicine: "medicine",
      med: "medicine",
      drug: "medicine",
      "raw-material": "raw-material",
      raw: "raw-material",
      "finished-product": "finished-product",
      finished: "finished-product",
    };
    const productType = productTypeMap[productTypeRaw] ?? productTypeRaw;

    if (
      !["physical", "service", "medicine", "raw-material", "finished-product"].includes(
        productType,
      )
    ) {
      errors.push(
        `Invalid productType "${row.productType}". Use physical, medicine, service, etc.`,
      );
    }

    const name = (row.name ?? "").trim();
    if (name.length < 2) errors.push("Name is required (min 2 characters).");

    const categoryVal = (row.category ?? "").trim();
    const category = matchByCodeOrName(
      categories.map((c) => ({
        id: c.id,
        name: c.name,
        code: (c as { code?: string }).code,
      })),
      categoryVal,
    );
    if (!category) {
      errors.push(
        categoryVal
          ? `Category "${categoryVal}" not found. Create it under Categories first.`
          : "Category is required.",
      );
    }

    const stockUnit = matchByCodeOrName(
      units.map((u) => ({ id: u.id, name: u.name, code: u.code })),
      row.stockUnit || "PCS",
    );
    const purchaseUnit = matchByCodeOrName(
      units.map((u) => ({ id: u.id, name: u.name, code: u.code })),
      row.purchaseUnit || row.stockUnit || "PCS",
    );
    const salesUnit = matchByCodeOrName(
      units.map((u) => ({ id: u.id, name: u.name, code: u.code })),
      row.salesUnit || row.stockUnit || "PCS",
    );

    let dosageFormId: string | null = null;
    let drugCategoryId: string | null = null;
    let drugStrengthId: string | null = null;
    let prescriptionTypeId: string | null = null;
    let manufacturerId: string | null = null;
    let supplierId: string | null = null;

    if (productType === "medicine") {
      if (row.dosageForm) {
        const df = matchByCodeOrName(
          dosageForms.map((d) => ({ id: d.id, name: d.name, code: d.code })),
          row.dosageForm,
        );
        if (!df) errors.push(`Dosage form "${row.dosageForm}" not found.`);
        else dosageFormId = df.id;
      }
      if (row.drugCategory) {
        const dc = matchByCodeOrName(
          drugCategories.map((d) => ({ id: d.id, name: d.name, code: d.code })),
          row.drugCategory,
        );
        if (!dc) errors.push(`Drug category "${row.drugCategory}" not found.`);
        else drugCategoryId = dc.id;
      }
      if (row.drugStrength) {
        const ds = matchByCodeOrName(
          drugStrengths.map((d) => ({
            id: d.id,
            name: d.name,
            code: (d as { code?: string }).code ?? d.name,
          })),
          row.drugStrength,
        );
        if (!ds) errors.push(`Drug strength "${row.drugStrength}" not found.`);
        else drugStrengthId = ds.id;
      }
      if (row.prescriptionType) {
        const pt = matchByCodeOrName(
          prescriptionTypes.map((d) => ({
            id: d.id,
            name: d.name,
            code: d.code,
          })),
          row.prescriptionType,
        );
        if (!pt) {
          errors.push(`Prescription type "${row.prescriptionType}" not found.`);
        } else prescriptionTypeId = pt.id;
      }
    }

    if (row.manufacturer) {
      const m = matchByCodeOrName(
        manufacturers.map((x) => ({
          id: x.id,
          name: x.name,
          code: (x as { code?: string }).code,
        })),
        row.manufacturer,
      );
      if (!m) errors.push(`Manufacturer "${row.manufacturer}" not found.`);
      else manufacturerId = m.id;
    }
    if (row.supplier) {
      const s = matchByCodeOrName(
        suppliers.map((x) => ({
          id: x.id,
          name: x.name,
          code: (x as { code?: string }).code,
        })),
        row.supplier,
      );
      if (!s) errors.push(`Supplier "${row.supplier}" not found.`);
      else supplierId = s.id;
    }

    const payload = {
      productType,
      categoryId: category?.id ?? "00000000-0000-0000-0000-000000000000",
      supplierId,
      manufacturerId,
      drugCategoryId,
      dosageFormId,
      drugStrengthId,
      prescriptionTypeId,
      purchaseUnitId: purchaseUnit?.id ?? null,
      salesUnitId: salesUnit?.id ?? null,
      stockUnitId: stockUnit?.id ?? null,
      incomeAccountId: null,
      expenseAccountId: null,
      inventoryAccountId: null,
      taxRateId: null,
      name,
      genericName: (row.genericName || "").trim() || null,
      productBrand: (row.productBrand || "").trim() || null,
      description: (row.description || "").trim() || null,
      sku: (row.sku || "").trim() || null,
      barcode: (row.barcode || "").trim() || null,
      packSize: (row.packSize || "").trim() || null,
      costPrice: parseNumNull(row.costPrice),
      sellingPrice: parseNumNull(row.sellingPrice),
      trackInventory: parseBool(row.trackInventory, true),
      trackBatch: parseBool(
        row.trackBatch,
        productType === "medicine",
      ),
      trackExpiry: parseBool(
        row.trackExpiry,
        productType === "medicine",
      ),
      serialized: parseBool(row.serialized, false),
      allowNegativeStock: parseBool(row.allowNegativeStock, false),
      minimumStock: Math.round(parseNum(row.minimumStock, 0)),
      reorderLevel: Math.round(parseNum(row.reorderLevel, 0)),
      active: parseBool(row.active, true),
    };

    if (errors.length === 0) {
      const parsed = createProductSchema.safeParse(payload);
      if (!parsed.success) {
        const msgs = parsed.error.issues.map(
          (i) => `${i.path.join(".")}: ${i.message}`,
        );
        errors.push(...msgs);
      } else {
        const capabilityCheck = productRuleResolver.validateInput({
          businessCapabilities,
          input: parsed.data,
        });
        if (!capabilityCheck.valid) {
          errors.push(
            ...Object.values(capabilityCheck.errors).flat(),
          );
        }
      }
    }

    results.push({
      index,
      ok: errors.length === 0,
      errors,
      payload: errors.length === 0 ? payload : undefined,
      preview: {
        name: name || `(row ${index + 1})`,
        productType,
        sku: (row.sku || "").trim() || "—",
        category: categoryVal || "—",
      },
    });
  }

  const okCount = results.filter((r) => r.ok).length;
  return {
    success: true as const,
    message: `${okCount} of ${results.length} row(s) ready to import.`,
    results,
  };
}
