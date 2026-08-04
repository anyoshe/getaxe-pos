export interface DashboardSummary {
  branches: number;
  warehouses: number;
  users: number;
  products: number;
  suppliers: number;
  customers: number;
  todaySales: number;
  lowStock: number;
}

export interface OwnerDashboard {
  summary: DashboardSummary;
}