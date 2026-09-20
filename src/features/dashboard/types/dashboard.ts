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
  /** Expenses dated in next 30 days or unpaid-looking recent */
  upcomingExpenseCount: number;
  upcomingExpenseTotal: number;
  openArCount: number;
  openApCount: number;
}

/** Owner decision cues — surface “what to do next” on the home screen. */
export type AttentionKind =
  | "restock"
  | "expiry"
  | "receivable"
  | "payable"
  | "slow"
  | "expense"
  | "info";

export interface AttentionItem {
  kind: AttentionKind;
  title: string;
  detail: string;
  href: string;
}

export interface LowStockItem {
  productId: string;
  name: string;
  sku: string | null;
  quantity: number;
  reorderLevel: number;
}

export interface ExpiringBatchItem {
  productId: string;
  productName: string;
  batchNumber: string;
  expiryDate: string;
  quantityRemaining: number;
}

export interface TopProductItem {
  productId: string;
  name: string;
  revenue: number;
  quantity: number;
}

export interface SlowProductItem {
  productId: string;
  name: string;
  sku: string | null;
  quantity: number;
  daysWithoutSale: number;
}

export interface OwnerDashboard {
  summary: DashboardSummary;
  attention: AttentionItem[];
  lowStockItems: LowStockItem[];
  expiringBatches: ExpiringBatchItem[];
  topProducts: TopProductItem[];
  slowProducts: SlowProductItem[];
}
