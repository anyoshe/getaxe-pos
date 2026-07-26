import { db } from "@/db";

import {
  and,
  eq,
} from "drizzle-orm";

import {
  warehouses,
} from "@/db/schema/settings/warehouses";


const WAREHOUSE_CODE =
  process.env.WAREHOUSE_CODE ??
  "MAIN";


const WAREHOUSE_NAME =
  process.env.WAREHOUSE_NAME ??
  "Main Warehouse";


const WAREHOUSE_DESCRIPTION =
  process.env.WAREHOUSE_DESCRIPTION ??
  "Default business warehouse";


export async function provisionWarehouse(
  businessId: string,
  branchId: string
) {

  console.log(
    "Provisioning warehouse..."
  );


  let warehouse =
    await db.query.warehouses.findFirst({

      where: and(

        eq(
          warehouses.branchId,
          branchId
        ),

        eq(
          warehouses.code,
          WAREHOUSE_CODE
        )

      ),

    });



  if (!warehouse) {

    const [
      createdWarehouse
    ] =
      await db
        .insert(warehouses)
        .values({

          businessId,

          branchId,

          code:
            WAREHOUSE_CODE,

          name:
            WAREHOUSE_NAME,

          description:
            WAREHOUSE_DESCRIPTION,

          active:
            true,

        })
        .returning();


    warehouse =
      createdWarehouse;


    console.log(
      `Created warehouse: ${WAREHOUSE_NAME}`
    );


  } else {


    console.log(
      `Warehouse already exists: ${warehouse.name}`
    );


  }


  return warehouse;

}