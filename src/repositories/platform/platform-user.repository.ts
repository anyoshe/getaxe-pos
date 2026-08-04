import { eq } from "drizzle-orm";

import { Repository } from "@/repositories/base/repository";

import { platformUsers } from "@/db/schema";

export class PlatformUserRepository {
  async findByEmail(email: string) {
    return Repository.db.query.platformUsers.findFirst({
      where: eq(platformUsers.email, email),
    });
  }

  async create(values: typeof platformUsers.$inferInsert) {
    const [user] = await Repository.db
      .insert(platformUsers)
      .values(values)
      .returning();

    return user;
  }

  async findById(id: string) {
    return Repository.db.query.platformUsers.findFirst({
      where: eq(platformUsers.id, id),
    });
  }

  async findBusinessOwners() {
    return Repository.db.query.platformUsers.findMany({
      where: eq(
        platformUsers.role,
        "BUSINESS_OWNER",
      ),

      orderBy: (owner, { desc }) => [
        desc(owner.createdAt),
      ],
    });
  }
}

export const platformUserRepository =
  new PlatformUserRepository();