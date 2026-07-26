import { db } from "@/db";
import { and, eq, isNull } from "drizzle-orm";

import { taxRates } from "@/db/schema/finance/tax_rates";

const DEFAULT_TAX_RATES = [
  {
    code: "VAT16",
    name: "VAT 16%",
    rate: "16.00",
    description: "Kenya VAT Standard Rate",
    isDefault: true,
  },
  {
    code: "ZERO",
    name: "Zero Rated",
    rate: "0.00",
    description: "Zero Rated Supply",
    isDefault: false,
  },
  {
    code: "EXEMPT",
    name: "Tax Exempt",
    rate: "0.00",
    description: "VAT Exempt Supply",
    isDefault: false,
  },
];

export async function seedTaxRates() {
  console.log("Seeding global tax rates...");

  for (const tax of DEFAULT_TAX_RATES) {
    const existing = await db.query.taxRates.findFirst({
      where: and(
        eq(taxRates.code, tax.code),
        isNull(taxRates.businessId)
      ),
    });

    if (existing) {
      console.log(`Skipping ${tax.code}`);
      continue;
    }

    await db.insert(taxRates).values({
      businessId: null,
      code: tax.code,
      name: tax.name,
      rate: tax.rate,
      description: tax.description,
      isDefault: tax.isDefault,
      active: true,
    });

    console.log(`Created ${tax.code}`);
  }

  console.log("Global tax rates seeded.");
}