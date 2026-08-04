import type { OwnerDashboard } from "../types";

import { userRepository } from "@/repositories/users/user.repository";
import { branchesRepository } from "@/repositories/settings/branches.repository";
import { warehousesRepository } from "@/repositories/settings/warehouses.repository";
import { productRepository } from "@/repositories/inventory/products.repository";
import { supplierRepository } from "@/repositories/inventory/suppliers.repository";
import { customerRepository } from "@/repositories/sales/customer.repository";

class DashboardService {
  async getOwnerDashboard(businessId: string): Promise<OwnerDashboard> {
    const [branches, warehouses, users, products, suppliers, customers] =
      await Promise.all([
        branchesRepository.count(businessId),

        warehousesRepository.count(businessId),

        userRepository.count(businessId),

        productRepository.count(businessId),

        supplierRepository.count(businessId),

        customerRepository.count(businessId),
      ]);

    return {
      summary: {
        branches,

        warehouses,

        users,

        products,

        suppliers,

        customers,

        todaySales: 0,

        lowStock: 0,
      },
    };
  }
}

export const dashboardService = new DashboardService();
