import { Repository } from "@/repositories";

async function main() {
  const permissions =
    await Repository.db.query.permissions.findMany();

  console.log(
    JSON.stringify(
      permissions,
      null,
      2
    )
  );
}

main()
  .catch(console.error)
  .finally(() => process.exit());