import {
  userInvitationsRepository,
  roleRepository,
} from "@/repositories";

import type {
  CreateBusinessOwnerInput,
} from "../schemas/create-business-owner";


export class PlatformUserService {

  async createBusinessOwner(
    input: CreateBusinessOwnerInput,
    createdBy: string,
  ) {

    const existing =
      await userInvitationsRepository.findByEmail(
        input.email,
      );


    if (existing) {
      throw new Error(
        "Invitation already exists.",
      );
    }


    const role =
      await roleRepository.findByName(
        "BUSINESS_OWNER",
      );


    if (!role) {
      throw new Error(
        "BUSINESS_OWNER role not found.",
      );
    }


    return userInvitationsRepository.create({

      name: input.name,

      email: input.email,

      phone: input.phone ?? null,

      roleId: role.id,

      createdBy,

    });

  }

}


export const platformUserService =
  new PlatformUserService();