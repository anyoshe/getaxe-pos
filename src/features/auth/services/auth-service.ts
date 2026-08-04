import { verifyPassword } from "@/lib/auth/password";

import {
  userRepository,
  userInvitationsRepository,
} from "@/repositories";

import type { LoginInput } from "../schemas/login-schema";
import type { AuthUser } from "../types";

import type {
  AuthenticatedUser,
} from "../types";

export type AuthenticationResult =
  | {
      type: "USER";
      user: AuthenticatedUser;
    }
  | {
      type: "CREATE_PASSWORD";
      invitationId: string;
      email: string;
    }
  | {
      type: "BUSINESS_SETUP";
      invitationId: string;
      email: string;
    }
  | {
      type: "INVALID";
    };

export async function authenticateUser(
  credentials: LoginInput,
): Promise<AuthenticationResult> {

  //
  // Existing ERP user
  //

  const user =
    await userRepository.findActiveByEmail(
      credentials.email,
    );

  if (user) {

    const validPassword =
      await verifyPassword(
        credentials.password,
        user.passwordHash,
      );

    if (!validPassword) {
      return {
        type: "INVALID",
      };
    }

    return {
      type: "USER",

      user: {
        type: "USER",
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
      },
    };
  }

  //
  // Invitation
  //

  const invitation =
    await userInvitationsRepository.findByEmail(
      credentials.email,
    );

  if (!invitation) {
    return {
      type: "INVALID",
    };
  }

  //
  // No password created yet
  //

  if (!invitation.passwordHash) {
    return {
      type: "CREATE_PASSWORD",
      invitationId: invitation.id,
      email: invitation.email,
    };
  }

  //
  // Password exists
  //

  const validInvitationPassword =
    await verifyPassword(
      credentials.password,
      invitation.passwordHash,
    );

  if (!validInvitationPassword) {
    return {
      type: "INVALID",
    };
  }

  return {
    type: "BUSINESS_SETUP",
    invitationId: invitation.id,
    email: invitation.email,
  };
}