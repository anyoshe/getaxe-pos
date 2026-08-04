import { and, asc, eq, sql } from "drizzle-orm";

import { db } from "@/db";
import { branches } from "@/db/schema/settings/branches";

export interface CreateBranchInput {
  businessId: string;
  code: string;
  name: string;
  phone?: string | null;
  email?: string | null;
  county?: string | null;
  town?: string | null;
  address?: string | null;
  active?: boolean;
  isHeadOffice?: boolean;
}

export interface UpdateBranchInput {
  code?: string;
  name?: string;
  phone?: string | null;
  email?: string | null;
  county?: string | null;
  town?: string | null;
  address?: string | null;
  active?: boolean;
  isHeadOffice?: boolean;
}

class BranchesRepository {
  async findAll(businessId: string) {
    return db.query.branches.findMany({
      where: eq(branches.businessId, businessId),
      orderBy: asc(branches.name),
    });
  }

  async findById(id: string, businessId: string) {
    return db.query.branches.findFirst({
      where: and(eq(branches.id, id), eq(branches.businessId, businessId)),
    });
  }

  async findByCode(code: string, businessId: string) {
    return db.query.branches.findFirst({
      where: and(eq(branches.code, code), eq(branches.businessId, businessId)),
    });
  }

  async exists(code: string, businessId: string) {
    const branch = await this.findByCode(code, businessId);

    return !!branch;
  }

  async count(businessId: string) {
    const result = await db
      .select({
        count: sql<number>`count(*)`,
      })
      .from(branches)
      .where(eq(branches.businessId, businessId));

    return Number(result[0]?.count ?? 0);
  }

  async create(data: CreateBranchInput) {
    const [branch] = await db
      .insert(branches)
      .values({
        ...data,
      })
      .returning();

    return branch;
  }

  async update(id: string, businessId: string, data: UpdateBranchInput) {
    const [branch] = await db
      .update(branches)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(and(eq(branches.id, id), eq(branches.businessId, businessId)))
      .returning();

    return branch ?? null;
  }

  async delete(id: string, businessId: string) {
    const [branch] = await db
      .delete(branches)
      .where(and(eq(branches.id, id), eq(branches.businessId, businessId)))
      .returning();

    return branch ?? null;
  }
}

export const branchesRepository = new BranchesRepository();
