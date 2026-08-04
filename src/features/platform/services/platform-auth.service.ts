import { verifyPassword } from "@/lib/auth/password";

import {
  platformUserRepository,
} from "@/repositories";

import type {
  PlatformUser,
} from "../types";

export class PlatformAuthService {

  async authenticate(
    email: string,
    password: string,
  ): Promise<PlatformUser | null> {

    const user =
      await platformUserRepository.findByEmail(email);

    if (!user) {
      return null;
    }

    if (!user.active) {
      return null;
    }

    const valid =
      await verifyPassword(
        password,
        user.passwordHash,
      );

    if (!valid) {
      return null;
    }

    return user;
  }

}

export const platformAuthService =
  new PlatformAuthService();