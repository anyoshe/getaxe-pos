import { db } from "@/db";
import { eq } from "drizzle-orm";

import { countries } from "@/db/schema/settings/countries";

const DEFAULT_COUNTRIES = [
  {
    code: "KE",
    iso3: "KEN",
    name: "Kenya",
    phoneCode: "+254",
    currencyCode: "KES",
    timezone: "Africa/Nairobi",
  },
  {
    code: "UG",
    iso3: "UGA",
    name: "Uganda",
    phoneCode: "+256",
    currencyCode: "UGX",
    timezone: "Africa/Kampala",
  },
  {
    code: "TZ",
    iso3: "TZA",
    name: "Tanzania",
    phoneCode: "+255",
    currencyCode: "TZS",
    timezone: "Africa/Dar_es_Salaam",
  },
  {
    code: "RW",
    iso3: "RWA",
    name: "Rwanda",
    phoneCode: "+250",
    currencyCode: "RWF",
    timezone: "Africa/Kigali",
  },
  {
    code: "BI",
    iso3: "BDI",
    name: "Burundi",
    phoneCode: "+257",
    currencyCode: "BIF",
    timezone: "Africa/Bujumbura",
  },
  {
    code: "ET",
    iso3: "ETH",
    name: "Ethiopia",
    phoneCode: "+251",
    currencyCode: "ETB",
    timezone: "Africa/Addis_Ababa",
  },
  {
    code: "SS",
    iso3: "SSD",
    name: "South Sudan",
    phoneCode: "+211",
    currencyCode: "SSP",
    timezone: "Africa/Juba",
  },
];

export async function seedCountries() {
  console.log("Seeding global countries...");

  for (const country of DEFAULT_COUNTRIES) {
    const existing = await db.query.countries.findFirst({
      where: eq(countries.code, country.code),
    });

    if (existing) {
      console.log(`${country.code} already exists`);
      continue;
    }

    await db.insert(countries).values({
      ...country,
      active: true,
    });

    console.log(`Created ${country.code}`);
  }

  console.log("Global countries seeded.");
}