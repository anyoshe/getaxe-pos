import { branchesRepository } from "@/repositories/settings/branches.repository";

import type { CreateBranchInput, UpdateBranchInput } from "../schemas/branch";

class BranchesService {
  async getBranches(businessId: string) {
    return branchesRepository.findAll(businessId);
  }

  async getBranch(id: string, businessId: string) {
    const branch = await branchesRepository.findById(id, businessId);

    if (!branch) {
      throw new Error("Branch not found.");
    }

    return branch;
  }

  async getBranchOptions(businessId: string) {
    return branchesRepository.findAll(businessId);
  }

  async createBranch(data: CreateBranchInput) {
    const exists = await branchesRepository.exists(data.code, data.businessId);

    if (exists) {
      throw new Error("Branch code already exists.");
    }

    // Future rule:
    // if (data.isHeadOffice) {
    //   await this.ensureSingleHeadOffice(data.businessId);
    // }

    return branchesRepository.create(data);
  }

  async updateBranch(id: string, businessId: string, data: UpdateBranchInput) {
    const branch = await branchesRepository.findById(id, businessId);

    if (!branch) {
      throw new Error("Branch not found.");
    }

    if (data.code && data.code !== branch.code) {
      const exists = await branchesRepository.exists(data.code, businessId);

      if (exists) {
        throw new Error("Branch code already exists.");
      }
    }

    return branchesRepository.update(id, businessId, data);
  }

  async deleteBranch(id: string, businessId: string) {
    const branch = await branchesRepository.findById(id, businessId);

    if (!branch) {
      throw new Error("Branch not found.");
    }

    // Future business rules:
    // - Cannot delete Head Office.
    // - Cannot delete if warehouses exist.
    // - Cannot delete if users belong to branch.
    // - Cannot delete if sales exist.

    return branchesRepository.delete(id, businessId);
  }

  async createHeadOffice(businessId: string) {
    const existing = await branchesRepository.findByCode("MAIN", businessId);

    if (existing) {
      return existing;
    }

    return branchesRepository.create({
      businessId,

      code: "MAIN",

      name: "Head Office",

      isHeadOffice: true,

      active: true,
    });
  }
}

export const branchesService = new BranchesService();
