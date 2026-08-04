import { client } from "@/db";

import { seedSystemPermissions } from "./system/permissions";
import { seedSystemRoles } from "./system/roles";
import { seedSystemRolePermissions } from "./system/role-permissions";
import { seedSuperAdmin } from "./platform/super-admin";


async function main() {

  console.log(
    "Starting database seed..."
  );


  await seedSystemPermissions();

  await seedSystemRoles();

  await seedSystemRolePermissions();


  //
  // Platform
  //
  await seedSuperAdmin();


  console.log(
    "Database seed completed."
  );

}


main()
  .then(async () => {

    await client.end();

    process.exit(0);

  })
  .catch(async (error) => {

    console.error(error);

    await client.end();

    process.exit(1);

  });