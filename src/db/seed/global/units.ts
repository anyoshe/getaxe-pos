import { db } from "@/db";

import { units } from "@/db/schema/settings/units";

import { eq, and, isNull } from "drizzle-orm";

/**
 * Global UoM catalogue.
 * Pharmacy: prefer TAB/CAP/STRIP for medicines; PCS only for non-dose items
 * (gloves, syringes, devices).
 */
const globalUnits: Array<{
  code: string;
  name: string;
  symbol: string;
  description: string;
  category: string;
  allowDecimals?: boolean;
}> = [
  // Count — discrete; whole numbers only
  {
    code: "PCS",
    name: "Pieces",
    symbol: "pcs",
    description: "Individual non-dose items (devices, gloves, syringes, etc.)",
    category: "count",
    allowDecimals: false,
  },
  {
    code: "TAB",
    name: "Tablet",
    symbol: "tab",
    description: "Solid oral tablet — preferred stock unit for tablet medicines",
    category: "count",
    allowDecimals: false,
  },
  {
    code: "CAP",
    name: "Capsule",
    symbol: "cap",
    description: "Oral capsule — preferred stock unit for capsule medicines",
    category: "count",
    allowDecimals: false,
  },
  {
    code: "STRIP",
    name: "Strip",
    symbol: "strip",
    description: "Blister strip (set pieces-per-strip on the product)",
    category: "count",
    allowDecimals: false,
  },
  {
    code: "BOX",
    name: "Box",
    symbol: "box",
    description: "Box / outer pack (set pieces-per-box on the product)",
    category: "count",
    allowDecimals: false,
  },
  {
    code: "BOT",
    name: "Bottle",
    symbol: "btl",
    description: "Bottle (syrup, suspension, eye drops as whole bottle)",
    category: "count",
    allowDecimals: false,
  },
  {
    code: "SACH",
    name: "Sachet",
    symbol: "sach",
    description: "Single sachet (ORS, powder)",
    category: "count",
    allowDecimals: false,
  },
  {
    code: "TUBE",
    name: "Tube",
    symbol: "tube",
    description: "Cream / ointment tube",
    category: "count",
    allowDecimals: false,
  },
  {
    code: "VIAL",
    name: "Vial",
    symbol: "vial",
    description: "Injection vial",
    category: "count",
    allowDecimals: false,
  },
  {
    code: "AMP",
    name: "Ampoule",
    symbol: "amp",
    description: "Injection ampoule",
    category: "count",
    allowDecimals: false,
  },
  // Mass / volume — decimals allowed
  {
    code: "KG",
    name: "Kilogram",
    symbol: "kg",
    description: "Weight measurement — decimals allowed (e.g. 4.5 kg)",
    category: "mass",
    allowDecimals: true,
  },
  {
    code: "G",
    name: "Gram",
    symbol: "g",
    description: "Weight measurement — decimals allowed (e.g. 0.5 g)",
    category: "mass",
    allowDecimals: true,
  },
  {
    code: "LTR",
    name: "Litre",
    symbol: "L",
    description: "Liquid volume — decimals allowed (e.g. 5.5 L)",
    category: "volume",
    allowDecimals: true,
  },
  {
    code: "ML",
    name: "Millilitre",
    symbol: "mL",
    description: "Liquid volume — decimals allowed",
    category: "volume",
    allowDecimals: true,
  },
  {
    code: "M",
    name: "Metre",
    symbol: "m",
    description: "Length measurement (whole or product-specific)",
    category: "length",
    allowDecimals: false,
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
          allowDecimals: unit.allowDecimals ?? (unit.category === "mass" || unit.category === "volume"),
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
      allowDecimals:
        unit.allowDecimals ??
        (unit.category === "mass" || unit.category === "volume"),
      businessId: null,
      active: true,
    });

    console.log(`Created ${unit.code}`);
  }

  console.log("Global units seeded.");
}
