import { db } from "@/db";
import { and, eq, isNull } from "drizzle-orm";

import { roles } from "@/db/schema/users/roles";

const SYSTEM_ROLES = [
  {
    name: "SUPER_ADMIN",
    description: "Platform super administrator",
  },
  {
    name: "ADMINISTRATOR",
    description: "Business administrator",
  },
  {
    name: "MANAGER",
    description: "Business manager",
  },
  {
    name: "ACCOUNTANT",
    description: "Finance and accounting",
  },
  {
    name: "PURCHASING_OFFICER",
    description: "Purchasing officer",
  },
  {
    name: "STORE_KEEPER",
    description: "Inventory controller",
  },
  {
    name: "SALES_PERSON",
    description: "Sales representative",
  },
  {
    name: "CASHIER",
    description: "Point of sale cashier",
  },
  {
    name: "PHARMACIST",
    description: "Licensed pharmacist",
  },
  {
    name: "DOCTOR",
    description: "Medical doctor",
  },
  {
    name: "NURSE",
    description: "Registered nurse",
  },
  {
    name: "RECEPTIONIST",
    description: "Reception and front office",
  },
];

export async function seedSystemRoles() {
  console.log("Seeding system roles...");

  for (const role of SYSTEM_ROLES) {
    const existing = await db.query.roles.findFirst({
      where: and(
        isNull(roles.businessId),
        eq(roles.name, role.name)
      ),
    });

    if (existing) {
      console.log(`Skipping ${role.name}`);
      continue;
    }

    await db.insert(roles).values({
      businessId: null,
      name: role.name,
      description: role.description,
      isSystem: true,
      active: true,
    });

    console.log(`Created ${role.name}`);
  }

  console.log("System roles seeded.");
}