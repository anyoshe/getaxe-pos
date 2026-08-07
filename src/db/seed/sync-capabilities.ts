import {
  client,
} from "@/db";

import {
  capabilitySyncService,
} from "@/features/capabilities/services";

async function main() {

  console.log(
    "Synchronizing capabilities...",
  );

  await capabilitySyncService.sync();

  console.log(
    "Capabilities synchronized successfully.",
  );

  await client.end();

}

main()
  .catch(async error => {

    console.error(error);

    await client.end();

    process.exit(1);

  });