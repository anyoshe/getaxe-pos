import { and, eq } from "drizzle-orm";

import { users } from "@/db/schema/users/users";
import { roles } from "@/db/schema/users/roles";

import { Repository } from "../base/repository";

export class UserRepository {
  async findById(id: string) {
    return Repository.db.query.users.findFirst({
      where: eq(users.id, id),
      with: {
        role: true,
        business: true,
      },
    });
  }

  async findByEmail(email: string) {
    return Repository.db.query.users.findFirst({
      where: eq(users.email, email),
      with: {
        role: true,
        business: true,
      },
    });
  }

  async findActiveByEmail(email: string) {
    const result = await Repository.db
      .select({
        id: users.id,
        businessId: users.businessId,
        roleId: users.roleId,

        name: users.name,
        email: users.email,
        phone: users.phone,

        passwordHash: users.passwordHash,

        active: users.active,

        roleName: roles.name,
        roleSystem: roles.isSystem,
      })
      .from(users)
      .innerJoin(
        roles,
        eq(users.roleId, roles.id)
      )
      .where(
        and(
          eq(users.email, email),
          eq(users.active, true),
          eq(roles.active, true)
        )
      )
      .limit(1);

    return result[0] ?? null;
  }

  async exists(id: string) {
    const user = await Repository.db.query.users.findFirst({
      where: eq(users.id, id),
      columns: {
        id: true,
      },
    });

    return !!user;
  }

  async create(values: typeof users.$inferInsert) {
    const [user] = await Repository.db
      .insert(users)
      .values(values)
      .returning();

    return user;
  }

  async update(
    id: string,
    values: Partial<typeof users.$inferInsert>
  ) {
    const [user] = await Repository.db
      .update(users)
      .set(values)
      .where(eq(users.id, id))
      .returning();

    return user;
  }

  async delete(id: string) {
    await Repository.db
      .delete(users)
      .where(eq(users.id, id));
  }
}

export const userRepository = new UserRepository();