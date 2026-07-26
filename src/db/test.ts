import { db } from "@/db";

async function test() {

  const user = await db.query.users.findFirst({
    with: {
      role: true,
      business: true,
    },
  });

  console.dir(user, { depth: null });

  process.exit(0);

}

test();
