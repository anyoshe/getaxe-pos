import {
  hashPassword,
} from "@/lib/auth/password";

import {
  userInvitationsRepository,
} from "@/repositories";

export class CreatePasswordService {

  async createPassword(
    email: string,
    password: string,
  ) {

    const invitation =
      await userInvitationsRepository.findByEmail(
        email,
      );

    if (!invitation) {
      throw new Error(
        "Invitation not found.",
      );
    }

    switch (invitation.status) {

      case "INVITED":
        break;

      case "PASSWORD_CREATED":
        throw new Error(
          "Password has already been created.",
        );

      case "COMPLETED":
        throw new Error(
          "Business has already been created.",
        );

      default:
        throw new Error(
          "Invitation is no longer valid.",
        );

    }

    const passwordHash =
      await hashPassword(
        password,
      );

    await userInvitationsRepository.updatePassword(
      invitation.id,
      passwordHash,
    );

    await userInvitationsRepository.updateStatus(
      invitation.id,
      "PASSWORD_CREATED",
    );

    return {
      success: true,
    };

  }

}

export const createPasswordService =
  new CreatePasswordService();