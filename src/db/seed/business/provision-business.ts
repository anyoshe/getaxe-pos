import { db } from "@/db";

import { eq } from "drizzle-orm";

import { businesses } from "@/db/schema/core/businesses";

const BUSINESS_NAME =
  process.env.BUSINESS_NAME ??
  "GetAxe Technologies Ltd";

const BUSINESS_TYPE =
  process.env.BUSINESS_TYPE ??
  "RETAIL";

const BUSINESS_COUNTRY =
  process.env.BUSINESS_COUNTRY ??
  "Kenya";

const BUSINESS_CURRENCY =
  process.env.BUSINESS_CURRENCY ??
  "KES";

const BUSINESS_TIMEZONE =
  process.env.BUSINESS_TIMEZONE ??
  "Africa/Nairobi";

export async function provisionBusiness() {

  console.log(
    "Provisioning business..."
  );

  let business =
    await db.query.businesses.findFirst({
      where: eq(
        businesses.name,
        BUSINESS_NAME
      ),
    });

  if (!business) {

    const [createdBusiness] =
      await db
        .insert(businesses)
        .values({
          name: BUSINESS_NAME,

          businessType: BUSINESS_TYPE as
            | "RETAIL"
            | "WHOLESALE"
            | "PHARMACY"
            | "CHEMIST"
            | "CLINIC"
            | "HOSPITAL",

          country: BUSINESS_COUNTRY,

          currency: BUSINESS_CURRENCY,

          timezone: BUSINESS_TIMEZONE,

          active: true,
        })
        .returning();

    business = createdBusiness;

    console.log(
      `Created business: ${business.name}`
    );

  } else {

    console.log(
      `Business already exists: ${business.name}`
    );

  }

  return business;

}