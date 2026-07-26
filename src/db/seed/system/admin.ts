import { db } from "@/db";

import {
  and,
  eq,
  isNull,
} from "drizzle-orm";

import {
  businesses,
} from "@/db/schema/core/businesses";

import {
  roles,
} from "@/db/schema/users/roles";

import {
  users,
} from "@/db/schema/users/users";

import {
  hashPassword,
} from "@/lib/auth/password";


/* =====================================================
   Environment
===================================================== */

const ADMIN_ROLE =
  process.env.ADMIN_ROLE ??
  "ADMINISTRATOR";

const ADMIN_NAME =
  process.env.ADMIN_NAME ??
  "Admin";

const ADMIN_EMAIL =
  process.env.ADMIN_EMAIL ??
  "admin@getaxekenya.com";

const ADMIN_PASSWORD =
  process.env.ADMIN_PASSWORD ??
  "Admin@12345";


export async function seedAdmin(
  businessId: string
){

  console.log(
    "Seeding system admin..."
  );
//
// 1. Load business
//

const business =
  await db.query.businesses.findFirst({
    where: eq(
      businesses.id,
      businessId
    ),
  });

if (!business) {

  throw new Error(
    `Business ${businessId} not found.`
  );

}

console.log(
  `Using business: ${business.name}`
);
  
  //
  // 2. Get global Administrator role
  //

  const role =
    await db.query.roles.findFirst({
      where: and(

        eq(
          roles.name,
          ADMIN_ROLE
        ),

        eq(
          roles.isSystem,
          true
        ),

        isNull(
          roles.businessId
        ),

      ),
    });

  if (!role) {

    throw new Error(
      `Global ${ADMIN_ROLE} role not found. Run pnpm db:seed first.`
    );

  }

  console.log(
    `Using global role: ${ADMIN_ROLE}`
  );


  //
  // 3. Find or create admin user
  //

  let user =
    await db.query.users.findFirst({
      where: and(

        eq(
          users.businessId,
          business.id
        ),

        eq(
          users.email,
          ADMIN_EMAIL
        ),

      ),
    });

  if (!user) {

    const passwordHash =
      await hashPassword(
        ADMIN_PASSWORD
      );

    const [createdUser] =
      await db
        .insert(users)
        .values({

          businessId:
            business.id,

          roleId:
            role.id,

          name:
            ADMIN_NAME,

          email:
            ADMIN_EMAIL,

          phone:
            null,

          passwordHash,

          active:
            true,

        })
        .returning();

    user =
      createdUser;

    console.log(
      `Created admin user: ${ADMIN_EMAIL}`
    );

  } else {

    console.log(
      `Admin user already exists: ${ADMIN_EMAIL}`
    );

  }


  //
  // 3.5 Ensure admin uses global Administrator role
  //

  if (user.roleId !== role.id) {

    await db
      .update(users)
      .set({
        roleId:
          role.id,
      })
      .where(
        eq(
          users.id,
          user.id
        )
      );

    user.roleId =
      role.id;

    console.log(
      `Updated admin role to ${ADMIN_ROLE}`
    );

  }


  //
  // 4. Ensure business creator is linked
  //

  if (
    !business.createdBy ||
    business.createdBy !== user.id
  ) {

    await db
      .update(businesses)
      .set({
        createdBy:
          user.id,
      })
      .where(
        eq(
          businesses.id,
          business.id
        )
      );

    console.log(
      "Updated business creator"
    );

  }

  console.log(
    "System admin seed complete."
  );

}