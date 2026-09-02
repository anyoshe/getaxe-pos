import { db } from "@/db";

import { units } from "@/db/schema/settings/units";

import { eq, and, isNull } from "drizzle-orm";

/**
 * Global UoM catalogue.
 * Pharmacy: prefer TAB/CAP/STRIP for medicines; PCS only for non-dose items
 * (gloves, syringes, devices).
 */
const globalUnits = [
  // Count — general retail / devices
  {
    code: "PCS",
    name: "Pieces",
    symbol: "pcs",
    description: "Individual non-dose items (devices, gloves, syringes, etc.)",
    category: "count",
  },
  // Pharmacy solid dose
  {
    code: "TAB",
    name: "Tablet",
    symbol: "tab",
    description: "Solid oral tablet — preferred stock unit for tablet medicines",
    category: "count",
  },
  {
    code: "CAP",
    name: "Capsule",
    symbol: "cap",
    description: "Oral capsule — preferred stock unit for capsule medicines",
    category: "count",
  },
  {
    code: "STRIP",
    name: "Strip",
    symbol: "strip",
    description: "Blister strip (set pieces-per-strip on the product)",
    category: "count",
  },
  {
    code: "BOX",
    name: "Box",
    symbol: "box",
    description: "Box / outer pack (set pieces-per-box on the product)",
    category: "count",
  },
  {
    code: "BOT",
    name: "Bottle",
    symbol: "btl",
    description: "Bottle (syrup, suspension, eye drops as whole bottle)",
    category: "count",
  },
  {
    code: "SACH",
    name: "Sachet",
    symbol: "sach",
    description: "Single sachet (ORS, powder)",
    category: "count",
  },
  {
    code: "TUBE",
    name: "Tube",
    symbol: "tube",
    description: "Cream / ointment tube",
    category: "count",
  },
  {
    code: "VIAL",
    name: "Vial",
    symbol: "vial",
    description: "Injection vial",
    category: "count",
  },
  {
    code: "AMP",
    name: "Ampoule",
    symbol: "amp",
    description: "Injection ampoule",
    category: "count",
  },
  // Mass / volume / length
  {
    code: "KG",
    name: "Kilogram",
    symbol: "kg",
    description: "Weight measurement",
    category: "mass",
  },
  {
    code: "G",
    name: "Gram",
    symbol: "g",
    description: "Weight measurement",
    category: "mass",
  },
  {
    code: "LTR",
    name: "Litre",
    symbol: "L",
    description: "Liquid volume",
    category: "volume",
  },
  {
    code: "ML",
    name: "Millilitre",
    symbol: "mL",
    description: "Liquid volume (syrups measured by volume)",
    category: "volume",
  },
  {
    code: "M",
    name: "Metre",
    symbol: "m",
    description: "Length measurement",
    category: "length",
  },
] as const;

export async function seedGlobalUnits() {
  console.log("Seeding global units...");

  for (const unit of globalUnits) {
    const existing = await db.query.units.findFirst({
      where: and(eq(units.code, unit.code), isNull(units.businessId)),
    });

    if (existing) {
      // Keep catalogue descriptions current without changing ids
      await db
        .update(units)
        .set({
          name: unit.name,
          symbol: unit.symbol,
          description: unit.description,
          category: unit.category,
          updatedAt: new Date(),
        })
        .where(eq(units.id, existing.id));
      console.log(`Updated ${unit.code}`);
      continue;
    }

    await db.insert(units).values({
      code: unit.code,
      name: unit.name,
      symbol: unit.symbol,
      description: unit.description,
      category: unit.category,
      businessId: null,
      active: true,
    });

    console.log(`Created ${unit.code}`);
  }

  console.log("Global units seeded.");
}
