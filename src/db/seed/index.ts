import { client } from "@/db";
import { provisionCompleteBusiness } 
from "@/services/business/business-provisioning.service";


async function main() {

  console.log(
    "Starting database seed..."
  );


  await provisionCompleteBusiness();


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