import { and, eq } from "drizzle-orm";

import { db } from "@/db";
import { categories } from "@/db/schema/inventory/categories";

/**
 * Inventory product categories (products.category_id) — NOT pharmacy drug_categories.
 * Pharmacy seed fills drug classification; the wizard still requires a product Category.
 */
const DEFAULT_PHARMACY_PRODUCT_CATEGORIES = [
  { name: "Medicines", description: "Prescription and OTC medicines" },
  { name: "OTC / General", description: "Over-the-counter and general retail" },
  { name: "Surgical & consumables", description: "Syringes, dressings, consumables" },
  { name: "Personal care", description: "Hygiene and personal care" },
  { name: "Baby care", description: "Infant and maternal products" },
  { name: "Supplements", description: "Vitamins and supplements" },
  { name: "Medical devices", description: "Devices and equipment" },
  { name: "Other", description: "Uncategorised products" },
];

const DEFAULT_RETAIL_PRODUCT_CATEGORIES = [
  { name: "General", description: "General merchandise" },
  { name: "Other", description: "Uncategorised products" },
];

const PHARMACY_TYPES = new Set([
  "PHARMACY",
  "CHEMIST",
  "CLINIC",
  "HOSPITAL",
  "LABORATORY",
  "OPTICAL",
]);

export async function seedDefaultProductCategories(
  businessId: string,
  businessType?: string | null,
): Promise<number> {
  const list =
    businessType && PHARMACY_TYPES.has(businessType.toUpperCase())
      ? DEFAULT_PHARMACY_PRODUCT_CATEGORIES
      : DEFAULT_RETAIL_PRODUCT_CATEGORIES;

  let created = 0;
  for (const row of list) {
    const existing = await db
      .select({ id: categories.id })
      .from(categories)
      .where(
        and(
          eq(categories.businessId, businessId),
          eq(categories.name, row.name),
        ),
      )
      .limit(1);
    if (existing.length > 0) continue;
    await db.insert(categories).values({
      businessId,
      name: row.name,
      description: row.description,
      active: true,
    });
    created++;
  }
  return created;
}
