import { categoryRepository } from "@/repositories/inventory/categories.repository";

import type { InferInsertModel } from "drizzle-orm";
import { categories } from "@/db/schema/inventory/categories";

type CategoryInsert =
  InferInsertModel<typeof categories>;

export class CategoryService {
  async getCategories(
    businessId: string
  ) {
    return categoryRepository.findAll(
      businessId
    );
  }

  async getCategory(
    id: string
  ) {
    const category =
      await categoryRepository.findById(id);

    if (!category) {
      throw new Error(
        "Category not found."
      );
    }

    return category;
  }

  async createCategory(
    data: CategoryInsert
  ) {
    const exists =
      await categoryRepository.existsByName(
        data.businessId,
        data.name
      );

    if (exists) {
      throw new Error(
        "Category already exists."
      );
    }

    return categoryRepository.create(
      data
    );
  }

  async updateCategory(
    id: string,
    data: Partial<CategoryInsert>
  ) {
    const existing =
      await categoryRepository.findById(id);

    if (!existing) {
      throw new Error(
        "Category not found."
      );
    }

    if (
      data.name &&
      data.name !== existing.name
    ) {
      const exists =
        await categoryRepository.existsByName(
          existing.businessId,
          data.name
        );

      if (exists) {
        throw new Error(
          "Category already exists."
        );
      }
    }

    return categoryRepository.update(
      id,
      data
    );
  }

  async deleteCategory(
    id: string
  ) {
    const existing =
      await categoryRepository.findById(id);

    if (!existing) {
      throw new Error(
        "Category not found."
      );
    }

    return categoryRepository.deactivate(
      id
    );
  }

  async activateCategory(
    id: string
  ) {
    const existing =
      await categoryRepository.findById(id);

    if (!existing) {
      throw new Error(
        "Category not found."
      );
    }

    return categoryRepository.update(
      id,
      {
        active: true,
      }
    );
  }
}

export const categoryService =
  new CategoryService();