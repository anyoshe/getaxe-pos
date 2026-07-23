import { db } from "@/db";
import { eq } from "drizzle-orm";
import { businesses } from "@/db/schema/core/businesses";
import { roles } from "@/db/schema/users/roles";
import { users } from "@/db/schema/users/users";

import { hashPassword } from "@/lib/auth/password";


async function seedAdmin() {

  console.log("Creating GetAxe admin...");


  // 1. Create business

  const [business] =
    await db
      .insert(businesses)
      .values({
        name: "GetAxe Technologies Ltd",

        businessType: "RETAIL",

        country: "Kenya",

        currency: "KES",

        timezone:
          "Africa/Nairobi",

        active: true,
      })
      .returning();



  // 2. Create role

  const [role] =
    await db
      .insert(roles)
      .values({

        businessId:
          business.id,

        name:
          "Administrator",

        description:
          "Full system access",

        isSystem:
          false,

        active:
          true,

      })
      .returning();



  // 3. Hash password

  const passwordHash =
    await hashPassword(
      "Admin@12345"
    );



  // 4. Create user

  const [user] =
    await db
      .insert(users)
      .values({

        businessId:
          business.id,

        roleId:
          role.id,

        name:
          "Admin",

        email:
          "admin@getaxekenya.com",

        phone:
          null,

        passwordHash,

        active:
          true,

      })
      .returning();



  // 5. Link business creator

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
    "================================"
  );

  console.log(
    "Admin created successfully"
  );

  console.log(
    "Email: admin@getaxekenya.com"
  );

  console.log(
    "Password: Admin@12345"
  );

  console.log(
    "================================"
  );

}


seedAdmin()
  .then(() => {
    process.exit(0);
  })
  .catch((error)=>{

    console.error(error);

    process.exit(1);

  });