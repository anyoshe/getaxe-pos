export interface DashboardSummary {
  branches: number;
  warehouses: number;
  users: number;
  products: number;
  suppliers: number;
  customers: number;
  todaySales: number;
  lowStock: number;
  todaySalesCount?: number;
  /** Live finance KPIs */
  cashTotal: number;
  openAr: number;
  openAp: number;
  stockValue: number;
  todayCashIn: number;
  todayCashByMethod: { method: string; total: number }[];
}

export interface OwnerDashboard {
  summary: DashboardSummary;
}
