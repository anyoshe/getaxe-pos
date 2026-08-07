import { and, desc, eq, ilike, or, sql, type SQL } from "drizzle-orm";

import { users } from "@/db/schema/users/users";
import { roles } from "@/db/schema/users/roles";

import { Repository } from "../base/repository";

export class UserRepository {
  async findById(id: string, businessId: string) {
    return Repository.db.query.users.findFirst({
      where: and(eq(users.id, id), eq(users.businessId, businessId)),
      with: {
        role: true,
        business: true,
      },
    });
  }

  async findByEmail(email: string, businessId: string) {
    return Repository.db.query.users.findFirst({
      where: and(eq(users.email, email), eq(users.businessId, businessId)),
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
      .innerJoin(roles, eq(users.roleId, roles.id))
      .where(
        and(
          eq(users.email, email),
          eq(users.active, true),
          eq(roles.active, true),
        ),
      )
      .limit(1);

    return result[0] ?? null;
  }

  async findMany(
    businessId: string,
    options?: {
      search?: string;
      roleId?: string;
      active?: boolean;
      page?: number;
      pageSize?: number;
    },
  ) {
    const page = options?.page ?? 1;

    const pageSize = options?.pageSize ?? 10;

    const conditions: SQL[] = [eq(users.businessId, businessId)];

    if (options?.search) {
      const searchCondition = or(
        ilike(users.name, `%${options.search}%`),
        ilike(users.email, `%${options.search}%`),
        ilike(users.phone, `%${options.search}%`),
      );

      if (searchCondition) {
        conditions.push(searchCondition);
      }
    }

    if (options?.roleId) {
      conditions.push(eq(users.roleId, options.roleId));
    }

    if (options?.active !== undefined) {
      conditions.push(eq(users.active, options.active));
    }

    const where = and(...conditions);
    const [items, total] = await Promise.all([
      Repository.db.query.users.findMany({
        where,

        with: {
          role: true,
          business: true,
        },

        orderBy: [desc(users.createdAt)],

        limit: pageSize,

        offset: (page - 1) * pageSize,
      }),

      Repository.db
        .select({
          count: sql<number>`count(*)`,
        })
        .from(users)
        .where(where),
    ]);

    return {
      items,

      total: Number(total[0]?.count ?? 0),

      page,

      pageSize,
    };
  }

  async activate(id: string) {
    const [user] = await Repository.db
      .update(users)
      .set({
        active: true,
      })
      .where(eq(users.id, id))
      .returning();

    return user;
  }

  async deactivate(id: string) {
    const [user] = await Repository.db
      .update(users)
      .set({
        active: false,
      })
      .where(eq(users.id, id))
      .returning();

    return user;
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
    const [user] = await Repository.db.insert(users).values(values).returning();

    return user;
  }

  async update(id: string, values: Partial<typeof users.$inferInsert>) {
    const [user] = await Repository.db
      .update(users)
      .set({
        ...values,
        updatedAt: new Date(),
      })
      .where(eq(users.id, id))
      .returning();

    return user;
  }

  async count(businessId: string) {
    const result = await Repository.db
      .select({
        count: sql<number>`count(*)`,
      })
      .from(users)
      .where(eq(users.businessId, businessId));

    return Number(result[0]?.count ?? 0);
  }

  async countByRole(roleId: string) {
    const result = await Repository.db
      .select({
        count: sql<number>`count(*)`,
      })
      .from(users)
      .where(eq(users.roleId, roleId));

    return Number(result[0]?.count ?? 0);
  }

  async delete(id: string) {
    await Repository.db.delete(users).where(eq(users.id, id));
  }
}

export const userRepository = new UserRepository();
