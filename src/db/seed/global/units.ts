import { db } from "@/db";

import {
  units,
} from "@/db/schema/settings/units";

import {
  eq,
  and,
  isNull,
} from "drizzle-orm";


const globalUnits = [
  {
    code: "PCS",
    name: "Pieces",
    symbol: "pcs",
    description: "Individual items",
  },

  {
    code: "KG",
    name: "Kilogram",
    symbol: "kg",
    description: "Weight measurement",
  },

  {
    code: "G",
    name: "Gram",
    symbol: "g",
    description: "Weight measurement",
  },

  {
    code: "LTR",
    name: "Litre",
    symbol: "L",
    description: "Liquid volume",
  },

  {
    code: "M",
    name: "Metre",
    symbol: "m",
    description: "Length measurement",
  },

  {
    code: "BOX",
    name: "Box",
    symbol: "box",
    description: "Box quantity",
  },
];


export async function seedGlobalUnits() {

  console.log(
    "Seeding global units..."
  );


  for (const unit of globalUnits) {


    const existing =
      await db.query.units.findFirst({
        where: and(
          eq(
            units.code,
            unit.code
          ),

          isNull(
            units.businessId
          )
        ),
      });



    if (existing) {

      console.log(
        `Skipping ${unit.code}`
      );

      continue;
    }



    await db
      .insert(units)
      .values({
        ...unit,

        businessId:
          null,

        active:
          true,
      });


    console.log(
      `Created ${unit.code}`
    );

  }


  console.log(
    "Global units seeded."
  );

}