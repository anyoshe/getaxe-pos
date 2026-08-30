import { eq } from "drizzle-orm";

import { Repository } from "../base/repository";

import {
  userInvitations,
} from "@/db/schema";

export class UserInvitationsRepository {

  async findById(id: string) {

    return Repository.db.query.userInvitations.findFirst({

      where: eq(
        userInvitations.id,
        id,
      ),

    });

  }

  async findByEmail(email: string) {

    return Repository.db.query.userInvitations.findFirst({

      where: eq(
        userInvitations.email,
        email,
      ),

    });

  }

  async findAll() {
    return Repository.db.query.userInvitations.findMany({
      orderBy: (row, { desc }) => [desc(row.createdAt)],
    });
  }

  async create(
    values: typeof userInvitations.$inferInsert,
  ) {

    const [invite] =
      await Repository.db
        .insert(userInvitations)
        .values(values)
        .returning();

    return invite;

  }

  async updateStatus(
    id: string,
    status:
      | "INVITED"
      | "PASSWORD_CREATED"
      | "COMPLETED",
  ) {

    const [invite] =
      await Repository.db
        .update(userInvitations)
        .set({
          status,
          updatedAt: new Date(),
        })
        .where(
          eq(
            userInvitations.id,
            id,
          ),
        )
        .returning();

    return invite;

  }

  async updatePassword(
    id: string,
    passwordHash: string,
  ) {

    const [invite] =
      await Repository.db
        .update(userInvitations)
        .set({
          passwordHash,
          updatedAt: new Date(),
        })
        .where(
          eq(
            userInvitations.id,
            id,
          ),
        )
        .returning();

    return invite;

  }

}

export const userInvitationsRepository =
  new UserInvitationsRepository();