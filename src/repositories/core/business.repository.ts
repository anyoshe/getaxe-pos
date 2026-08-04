import {
  eq,
} from "drizzle-orm";

import { Repository } from "../base/repository";

import {
  businesses,
} from "@/db/schema/core/businesses";

export class BusinessRepository {

  async findAll() {
    return Repository.db.query.businesses.findMany({
      orderBy: (businesses, { asc }) => [
        asc(businesses.name),
      ],
    });
  }

  async findById(
    id: string,
  ) {
    return Repository.db.query.businesses.findFirst({
      where: eq(
        businesses.id,
        id,
      ),
    });
  }

  async exists(
    id: string,
  ) {
    const business =
      await Repository.db.query.businesses.findFirst({
        where: eq(
          businesses.id,
          id,
        ),

        columns: {
          id: true,
        },
      });

    return !!business;
  }

  async create(
    values: typeof businesses.$inferInsert,
  ) {
    const [business] =
      await Repository.db
        .insert(businesses)
        .values(values)
        .returning();

    return business;
  }

  async update(
    id: string,
    values: Partial<typeof businesses.$inferInsert>,
  ) {
    const [business] =
      await Repository.db
        .update(businesses)
        .set({
          ...values,
          updatedAt: new Date(),
        })
        .where(
          eq(
            businesses.id,
            id,
          ),
        )
        .returning();

    return business;
  }

  async activate(
    id: string,
  ) {
    const [business] =
      await Repository.db
        .update(businesses)
        .set({
          active: true,
          updatedAt: new Date(),
        })
        .where(
          eq(
            businesses.id,
            id,
          ),
        )
        .returning();

    return business;
  }

  async deactivate(
    id: string,
  ) {
    const [business] =
      await Repository.db
        .update(businesses)
        .set({
          active: false,
          updatedAt: new Date(),
        })
        .where(
          eq(
            businesses.id,
            id,
          ),
        )
        .returning();

    return business;
  }

  async delete(
    id: string,
  ) {
    await Repository.db
      .delete(businesses)
      .where(
        eq(
          businesses.id,
          id,
        ),
      );
  }

}

export const businessRepository =
  new BusinessRepository();