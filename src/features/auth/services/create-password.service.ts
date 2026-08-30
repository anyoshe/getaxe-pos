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

    if (invitation.status === "COMPLETED") {
      throw new Error("Business has already been created. Sign in with your account password.");
    }
    if (
      invitation.status !== "INVITED" &&
      invitation.status !== "PASSWORD_CREATED"
    ) {
      throw new Error("Invitation is no longer valid.");
    }
    // INVITED or PASSWORD_CREATED: allow setting / replacing password before setup

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

    const updated = await userInvitationsRepository.findById(invitation.id);
    return updated ?? invitation;
  }

}

export const createPasswordService =
  new CreatePasswordService();