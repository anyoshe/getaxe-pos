import { client } from "@/db";
import { provisionCompleteBusiness } 
from "@/services/business/business-provisioning.service";
import { seedSystemPermissions } from "./system/permissions";
import { seedSystemRoles } from "./system/roles";
import { seedSystemRolePermissions } from "./system/role-permissions";



async function main() {
  console.log(
    "Starting database seed..."
  );

  await seedSystemPermissions();

  await seedSystemRoles();

  await provisionCompleteBusiness();

  await seedSystemRolePermissions();

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