import { db } from "@/db";

import {
  platformUsers,
} from "@/db/schema";

import {
  hashPassword,
} from "@/lib/auth/password";

import {
  eq,
} from "drizzle-orm";


export async function seedSuperAdmin() {

  const email =
    "superadmin@getaxe.tech";


  const existing =
    await db.query.platformUsers.findFirst({
      where:
        eq(
          platformUsers.email,
          email,
        ),
    });


  if (existing) {

    console.log(
      "SUPER_ADMIN already exists",
    );

    return;

  }


  await db
    .insert(platformUsers)
    .values({

      name:
        "GetAxe Super Admin",

      email,

      phone:
        null,

      passwordHash:
        await hashPassword(
          "Admin@12345",
        ),

      role:
        "SUPER_ADMIN",

      active:
        true,

    });


  console.log(
    "SUPER_ADMIN created",
  );

}