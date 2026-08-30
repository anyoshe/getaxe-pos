import {
  userInvitationsRepository,
  roleRepository,
} from "@/repositories";
import { hashPassword } from "@/lib/auth/password";
import type { CreateBusinessOwnerInput } from "../schemas/create-business-owner";

function generateTempPassword(length = 10): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";
  let out = "";
  const arr =
    typeof crypto !== "undefined" && "getRandomValues" in crypto
      ? crypto.getRandomValues(new Uint32Array(length))
      : Array.from({ length }, () => Math.floor(Math.random() * chars.length));
  for (let i = 0; i < length; i++) {
    out += chars[Number(arr[i]) % chars.length];
  }
  return out;
}

export class PlatformUserService {
  /**
   * Invite a business owner: stores invitation with a hashed first-login password.
   * Returns the plain temporary password once (for platform admin to share).
   */
  async createBusinessOwner(
    input: CreateBusinessOwnerInput,
    createdBy: string,
  ) {
    const existing = await userInvitationsRepository.findByEmail(input.email);
    if (existing) {
      throw new Error("An invitation already exists for this email.");
    }

    const role = await roleRepository.findByName("BUSINESS_OWNER");
    if (!role) {
      throw new Error(
        "BUSINESS_OWNER role not found. Seed system roles first.",
      );
    }

    const plainPassword =
      input.password && input.password.length >= 8
        ? input.password
        : generateTempPassword(10);

    const passwordHash = await hashPassword(plainPassword);

    const invitation = await userInvitationsRepository.create({
      name: input.name,
      email: input.email.trim().toLowerCase(),
      phone: input.phone?.trim() || null,
      roleId: role.id,
      createdBy,
      passwordHash,
      status: "PASSWORD_CREATED",
    });

    return {
      invitation,
      temporaryPassword: plainPassword,
      loginUrl: "/login",
      nextStep: "Owner signs in at /login → completes business setup at /setup",
    };
  }

  async listInvitations() {
    return userInvitationsRepository.findAll();
  }

  async resetTemporaryPassword(invitationId: string) {
    const invite = await userInvitationsRepository.findById(invitationId);
    if (!invite) throw new Error("Invitation not found.");
    if (invite.status === "COMPLETED") {
      throw new Error(
        "This owner already completed setup. Reset their ERP user password instead.",
      );
    }
    const plainPassword = generateTempPassword(10);
    const passwordHash = await hashPassword(plainPassword);
    await userInvitationsRepository.updatePassword(invite.id, passwordHash);
    await userInvitationsRepository.updateStatus(invite.id, "PASSWORD_CREATED");
    return { temporaryPassword: plainPassword, email: invite.email };
  }
}

export const platformUserService = new PlatformUserService();
