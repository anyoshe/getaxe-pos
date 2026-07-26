// import { eq, and } from "drizzle-orm";

// import { db } from "@/db";

// import { users } from "@/db/schema/users/users";
// import { roles } from "@/db/schema/users/roles";

// import { verifyPassword } from "@/lib/auth/password";

// import type { LoginInput } from "../schemas/login-schema";
// import type { AuthUser } from "../types";

// export async function authenticateUser(
//   credentials: LoginInput
// ): Promise<AuthUser | null> {

//   const result = await db
//     .select({
//       id: users.id,
//       businessId: users.businessId,
//       roleId: users.roleId,

//       name: users.name,
//       email: users.email,
//       phone: users.phone,

//       passwordHash: users.passwordHash,

//       active: users.active,

//       roleName: roles.name,
//       roleSystem: roles.isSystem,
//     })
//     .from(users)
//     .innerJoin(
//       roles,
//       eq(users.roleId, roles.id)
//     )
//     .where(
//       and(
//         eq(users.email, credentials.email),
//         eq(users.active, true),
//         eq(roles.active, true)
//       )
//     )
//     .limit(1);

//   if (!result.length) {
//     return null;
//   }

//   const user = result[0];

//   const validPassword = await verifyPassword(
//     credentials.password,
//     user.passwordHash
//   );

//   if (!validPassword) {
//     return null;
//   }

//   return {
//     id: user.id,
//     businessId: user.businessId,
//     roleId: user.roleId,

//     name: user.name,
//     email: user.email,
//     phone: user.phone,

//     active: user.active,

//     role: {
//       id: user.roleId,
//       name: user.roleName,
//       isSystem: user.roleSystem,
//     },
//   };
// }

import { verifyPassword } from "@/lib/auth/password";

import { userRepository } from "@/repositories/users/user.repository";

import type { LoginInput } from "../schemas/login-schema";
import type { AuthUser } from "../types";

export async function authenticateUser(
  credentials: LoginInput
): Promise<AuthUser | null> {

  const user = await userRepository.findActiveByEmail(
    credentials.email
  );

  if (!user) {
    return null;
  }

  const validPassword = await verifyPassword(
    credentials.password,
    user.passwordHash
  );

  if (!validPassword) {
    return null;
  }

  return {
    id: user.id,
    businessId: user.businessId,
    roleId: user.roleId,

    name: user.name,
    email: user.email,
    phone: user.phone,

    active: user.active,

    role: {
      id: user.roleId,
      name: user.roleName,
      isSystem: user.roleSystem,
    },
  };
}