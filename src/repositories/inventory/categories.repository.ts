import { and, eq } from "drizzle-orm";
import type { InferInsertModel } from "drizzle-orm";

import { categories } from "@/db/schema/inventory/categories";



type CategoryInsert =
  InferInsertModel<typeof categories>;

import {
  BaseRepository,
} from "../base";

export class CategoryRepository
  extends BaseRepository {


  async findAll(
    businessId: string
  ) {
    return this.database.query.categories.findMany({
      where: and(
        eq(categories.businessId, businessId),
        eq(categories.active, true)
      ),
      orderBy: (
        categories,
        { asc }
      ) => [asc(categories.name)],
    });
  }

  async findById(
    id: string
  ) {
    return this.database.query.categories.findFirst({
      where: eq(categories.id, id),

      with: {
        products: true,
      },
    });
  }

  async create(
    data: CategoryInsert
  ) {
    const [category] =
      await this.database
        .insert(categories)
        .values(data)
        .returning();

    return category;
  }

  async update(
    id: string,
    data: Partial<CategoryInsert>
  ) {
    const [category] =
      await this.database
        .update(categories)
        .set(data)
        .where(eq(categories.id, id))
        .returning();

    return category;
  }

  async delete(
    id: string
  ) {
    const [category] =
      await this.database
        .delete(categories)
        .where(eq(categories.id, id))
        .returning();

    return category;
  }

  async deactivate(
    id: string
  ) {
    const [category] =
      await this.database
        .update(categories)
        .set({
          active: false,
        })
        .where(
          eq(categories.id, id)
        )
        .returning();

    return category;
  }

  async existsByName(
    businessId: string,
    name: string
  ) {
    if (!name) {
      return false;
    }

    const category =
      await this.database.query.categories.findFirst({
        where: and(
          eq(categories.businessId, businessId),
          eq(categories.name, name)
        ),
      });

    return !!category;
  }
}

export const categoryRepository =
  new CategoryRepository();