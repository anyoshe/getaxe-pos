import { verifyPassword } from "@/lib/auth/password";

import {
  userRepository,
  userInvitationsRepository,
} from "@/repositories";

import type { LoginInput } from "../schemas/login-schema";
import type { AuthenticatedUser } from "../types";

export type AuthenticationResult =
  | { type: "USER"; user: AuthenticatedUser }
  | { type: "CREATE_PASSWORD"; invitationId: string; email: string }
  | { type: "BUSINESS_SETUP"; invitationId: string; email: string }
  | { type: "INVALID" };

export async function authenticateUser(
  credentials: LoginInput,
): Promise<AuthenticationResult> {
  // Same email can exist on multiple businesses — match by password, not limit(1).
  const candidates = await userRepository.findAllActiveByEmail(
    credentials.email,
  );

  if (candidates.length > 0) {
    const matches: typeof candidates = [];
    for (const user of candidates) {
      const validPassword = await verifyPassword(
        credentials.password,
        user.passwordHash,
      );
      if (validPassword) matches.push(user);
    }

    if (matches.length === 0) return { type: "INVALID" };

    // Prefer most recently used account when the same email+password exists
    // on more than one business (avoids silently logging into the wrong shop).
    matches.sort((a, b) => {
      const ta = (a.lastLoginAt ?? a.updatedAt)?.getTime?.() ?? 0;
      const tb = (b.lastLoginAt ?? b.updatedAt)?.getTime?.() ?? 0;
      return tb - ta;
    });
    const user = matches[0]!;

    await userRepository.touchLastLogin(user.id).catch(() => undefined);

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

  // ── Invitation / onboarding ─────────────────────────────────────
  const invitation = await userInvitationsRepository.findByEmail(
    credentials.email,
  );

  if (!invitation) return { type: "INVALID" };
  if (invitation.status === "COMPLETED") return { type: "INVALID" };

  if (invitation.status === "INVITED") {
    if (invitation.passwordHash) {
      const validTemp = await verifyPassword(
        credentials.password,
        invitation.passwordHash,
      );
      if (!validTemp) return { type: "INVALID" };
    }
    return {
      type: "CREATE_PASSWORD",
      invitationId: invitation.id,
      email: invitation.email,
    };
  }

  if (invitation.status === "PASSWORD_CREATED") {
    if (!invitation.passwordHash) {
      return {
        type: "CREATE_PASSWORD",
        invitationId: invitation.id,
        email: invitation.email,
      };
    }
    const valid = await verifyPassword(
      credentials.password,
      invitation.passwordHash,
    );
    if (!valid) return { type: "INVALID" };
    return {
      type: "BUSINESS_SETUP",
      invitationId: invitation.id,
      email: invitation.email,
    };
  }

  return { type: "INVALID" };
}
