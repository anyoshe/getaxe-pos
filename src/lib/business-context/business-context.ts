import "server-only";

import {
  requireCurrentUser,
} from "@/lib/auth/current-user";


export async function requireBusinessContext() {

  const user =
    await requireCurrentUser();


  if (!user.business) {

    throw new Error(
      "User is not assigned to a business."
    );

  }


  return {

    user,

    business:
      user.business,

    role:
      user.role,

  };

}