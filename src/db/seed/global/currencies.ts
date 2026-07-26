import { db } from "@/db";
import { eq } from "drizzle-orm";

import { currencies } from "@/db/schema/settings/currencies";

const DEFAULT_CURRENCIES = [
  {
    code: "KES",
    name: "Kenyan Shilling",
    symbol: "KSh",
    decimalPlaces: 2,
    isDefault: true,
  },
  {
    code: "USD",
    name: "US Dollar",
    symbol: "$",
    decimalPlaces: 2,
    isDefault: false,
  },
  {
    code: "EUR",
    name: "Euro",
    symbol: "€",
    decimalPlaces: 2,
    isDefault: false,
  },
  {
    code: "GBP",
    name: "Pound Sterling",
    symbol: "£",
    decimalPlaces: 2,
    isDefault: false,
  },
  {
    code: "TZS",
    name: "Tanzanian Shilling",
    symbol: "TSh",
    decimalPlaces: 2,
    isDefault: false,
  },
  {
    code: "UGX",
    name: "Ugandan Shilling",
    symbol: "USh",
    decimalPlaces: 0,
    isDefault: false,
  },
  {
    code: "RWF",
    name: "Rwandan Franc",
    symbol: "RF",
    decimalPlaces: 0,
    isDefault: false,
  },
];

export async function seedCurrencies() {
  console.log("Seeding global currencies...");

  for (const currency of DEFAULT_CURRENCIES) {
    const existing = await db.query.currencies.findFirst({
      where: eq(currencies.code, currency.code),
    });

    if (existing) {
      console.log(`${currency.code} already exists`);
      continue;
    }

    await db.insert(currencies).values({
      ...currency,
      active: true,
    });

    console.log(`Created ${currency.code}`);
  }

  console.log("Global currencies seeded.");
}