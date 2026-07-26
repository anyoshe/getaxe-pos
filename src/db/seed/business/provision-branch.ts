import { db } from "@/db";

import { eq, and } from "drizzle-orm";

import {
  branches,
} from "@/db/schema/settings/branches";


const BRANCH_CODE =
  process.env.BRANCH_CODE ??
  "MAIN";


const BRANCH_NAME =
  process.env.BRANCH_NAME ??
  "Main Branch";


export async function provisionBranch(
  businessId: string
) {

  console.log(
    "Provisioning branch..."
  );


  let branch =
    await db.query.branches.findFirst({
      where: and(
        eq(
          branches.businessId,
          businessId
        ),

        eq(
          branches.code,
          BRANCH_CODE
        )
      ),
    });


  if (!branch) {

    const [createdBranch] =
      await db
        .insert(branches)
        .values({

          businessId,

          code:
            BRANCH_CODE,

          name:
            BRANCH_NAME,

          isHeadOffice:
            true,

          active:
            true,

        })
        .returning();


    branch =
      createdBranch;


    console.log(
      `Created branch: ${BRANCH_NAME}`
    );


  } else {

    console.log(
      `Branch already exists: ${branch.name}`
    );

  }


  return branch;

}