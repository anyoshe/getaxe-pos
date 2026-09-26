import { and, asc, eq, sql } from "drizzle-orm";
import type { InferInsertModel } from "drizzle-orm";

import { categories } from "@/db/schema/inventory/categories";
import { products } from "@/db/schema/inventory/products";

import { BaseRepository } from "../base";

type CategoryInsert = InferInsertModel<typeof categories>;

export class CategoryRepository extends BaseRepository {
  /**
   * All categories for the business (active + inactive).
   * Inactive must stay visible so owners can set markup / reactivate —
   * products still reference them after “delete” (soft archive).
   */
  async findAll(businessId: string) {
    const rows = await this.database
      .select({
        id: categories.id,
        businessId: categories.businessId,
        name: categories.name,
        description: categories.description,
        markupPercent: categories.markupPercent,
        wholesaleMarkupPercent: categories.wholesaleMarkupPercent,
        active: categories.active,
        createdAt: categories.createdAt,
        updatedAt: categories.updatedAt,
        productCount: sql<number>`coalesce(count(${products.id}), 0)::int`,
      })
      .from(categories)
      .leftJoin(
        products,
        and(
          eq(products.categoryId, categories.id),
          eq(products.businessId, businessId),
        ),
      )
      .where(eq(categories.businessId, businessId))
      .groupBy(categories.id)
      .orderBy(asc(categories.name));

    return rows;
  }

  /** Active only — for product form pickers. */
  async findAllActive(businessId: string) {
    return this.database.query.categories.findMany({
      where: and(
        eq(categories.businessId, businessId),
        eq(categories.active, true),
      ),
      orderBy: (c, { asc: a }) => [a(c.name)],
    });
  }

  async findById(id: string) {
    return this.database.query.categories.findFirst({
      where: eq(categories.id, id),
      with: {
        products: true,
      },
    });
  }

  async create(data: CategoryInsert) {
    const [category] = await this.database
      .insert(categories)
      .values(data)
      .returning();

    return category;
  }

  async update(id: string, data: Partial<CategoryInsert>) {
    const [category] = await this.database
      .update(categories)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(categories.id, id))
      .returning();

    return category;
  }

  async delete(id: string) {
    const [category] = await this.database
      .delete(categories)
      .where(eq(categories.id, id))
      .returning();

    return category;
  }

  async deactivate(id: string) {
    const [category] = await this.database
      .update(categories)
      .set({ active: false, updatedAt: new Date() })
      .where(eq(categories.id, id))
      .returning();

    return category;
  }

  async existsByName(businessId: string, name: string) {
    if (!name) return false;

    const category = await this.database.query.categories.findFirst({
      where: and(
        eq(categories.businessId, businessId),
        eq(categories.name, name),
      ),
    });

    return !!category;
  }
}

export const categoryRepository = new CategoryRepository();
