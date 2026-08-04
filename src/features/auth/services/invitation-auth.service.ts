import { verifyPassword } from "@/lib/auth/password";

import {
  userInvitationsRepository,
} from "@/repositories";

export class InvitationAuthService {

  async findByEmail(
    email: string,
  ) {
    return userInvitationsRepository.findByEmail(
      email,
    );
  }

  async authenticate(
    email: string,
    password: string,
  ) {

    const invitation =
      await this.findByEmail(
        email,
      );

    if (!invitation) {
      return null;
    }

    if (!invitation.passwordHash) {
      return {
        state: "CREATE_PASSWORD",
        invitation,
      };
    }

    const valid =
      await verifyPassword(
        password,
        invitation.passwordHash,
      );

    if (!valid) {
      return null;
    }

    return {
      state: "BUSINESS_SETUP",
      invitation,
    };

  }

}

export const invitationAuthService =
  new InvitationAuthService();