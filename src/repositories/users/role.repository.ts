import {
  and,
  eq,
  isNull,
} from "drizzle-orm";

import { Repository } from "../base/repository";

import { roles } from "@/db/schema/users/roles";

export class RoleRepository {

  async findAll() {
    return Repository.db.query.roles.findMany({
      orderBy: (roles, { asc }) => [
        asc(roles.name),
      ],
    });
  }

  async findById(
    id: string,
  ) {
    return Repository.db.query.roles.findFirst({
      where: eq(
        roles.id,
        id,
      ),
    });
  }

  async findByName(
    name: string,
    businessId?: string,
  ) {
    if (businessId) {
      return Repository.db.query.roles.findFirst({
        where: and(
          eq(roles.name, name),
          eq(roles.businessId, businessId),
        ),
      });
    }

    return Repository.db.query.roles.findFirst({
      where: and(
        eq(roles.name, name),
        isNull(roles.businessId),
      ),
    });
  }

  async exists(
    id: string,
  ) {
    const role =
      await Repository.db.query.roles.findFirst({
        where: eq(
          roles.id,
          id,
        ),

        columns: {
          id: true,
        },
      });

    return !!role;
  }

  async create(
    values: typeof roles.$inferInsert,
  ) {
    const [role] =
      await Repository.db
        .insert(roles)
        .values(values)
        .returning();

    return role;
  }

  async update(
    id: string,
    values: Partial<typeof roles.$inferInsert>,
  ) {
    const [role] =
      await Repository.db
        .update(roles)
        .set({
          ...values,
          updatedAt: new Date(),
        })
        .where(
          eq(roles.id, id),
        )
        .returning();

    return role;
  }

  async activate(
    id: string,
  ) {
    const [role] =
      await Repository.db
        .update(roles)
        .set({
          active: true,
          updatedAt: new Date(),
        })
        .where(
          eq(roles.id, id),
        )
        .returning();

    return role;
  }

  async deactivate(
    id: string,
  ) {
    const [role] =
      await Repository.db
        .update(roles)
        .set({
          active: false,
          updatedAt: new Date(),
        })
        .where(
          eq(roles.id, id),
        )
        .returning();

    return role;
  }

  async delete(
    id: string,
  ) {
    await Repository.db
      .delete(roles)
      .where(
        eq(roles.id, id),
      );
  }

}

export const roleRepository =
  new RoleRepository();