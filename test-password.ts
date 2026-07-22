import "dotenv/config";

import {
  createSession,
  getSession,
} from "./src/lib/auth/session";

async function run() {
  await createSession({
    userId: "1",
    businessId: "2",
    roleId: "3",
    email: "admin@getaxe.com",
  });

  const session = await getSession();

  console.log(session);
}

run();