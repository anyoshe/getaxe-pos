import { db } from "@/db";

import {
  and,
  eq,
} from "drizzle-orm";

import {
  fiscalYears,
} from "@/db/schema/settings/fiscal_years";


const FISCAL_YEAR_CODE =
  process.env.FISCAL_YEAR_CODE ??
  "FY2026";


const FISCAL_YEAR_NAME =
  process.env.FISCAL_YEAR_NAME ??
  "Financial Year 2026";


const FISCAL_YEAR_START =
  process.env.FISCAL_YEAR_START ??
  "2026-01-01";


const FISCAL_YEAR_END =
  process.env.FISCAL_YEAR_END ??
  "2026-12-31";


export async function provisionFiscalYear(
  businessId: string
) {

  console.log(
    "Provisioning fiscal year..."
  );


  let fiscalYear =
    await db.query.fiscalYears.findFirst({

      where: and(

        eq(
          fiscalYears.businessId,
          businessId
        ),

        eq(
          fiscalYears.code,
          FISCAL_YEAR_CODE
        )

      ),

    });



  if (!fiscalYear) {


    const [
      createdFiscalYear
    ] =
      await db
        .insert(fiscalYears)
        .values({

          businessId,

          code:
            FISCAL_YEAR_CODE,

          name:
            FISCAL_YEAR_NAME,

          startDate:
            FISCAL_YEAR_START,

          endDate:
            FISCAL_YEAR_END,

          isCurrent:
            true,

          isClosed:
            false,

          allowPosting:
            true,

        })
        .returning();



    fiscalYear =
      createdFiscalYear;


    console.log(
      `Created fiscal year: ${FISCAL_YEAR_NAME}`
    );


  } else {


    console.log(
      `Fiscal year already exists: ${fiscalYear.name}`
    );


  }


  return fiscalYear;

}