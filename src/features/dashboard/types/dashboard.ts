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
  /** Gross profit = sale line revenue − product costPrice × stock qty */
  grossProfitMonth: number;
  grossProfitToday: number;
  revenueMonth: number;
  revenueToday: number;
}

export interface ProfitProductItem {
  productId: string;
  name: string;
  sku: string | null;
  quantity: number;
  revenue: number;
  cost: number;
  margin: number;
  marginPct: number;
  /** Invoice numbers where a line sold at/below cost (line-level). */
  atCostInvoices?: string[];
  atCostLineCount?: number;
}

/** One completed sale line sold at cost or below cost. */
export interface LossSaleLine {
  saleItemId: string;
  saleId: string;
  invoiceNumber: string;
  soldAt: string;
  productId: string;
  name: string;
  sku: string | null;
  quantity: number;
  unitPrice: number;
  revenue: number;
  unitCost: number;
  cost: number;
  margin: number;
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
  topProfitProducts: ProfitProductItem[];
  lossProducts: ProfitProductItem[];
  lossSaleLines?: LossSaleLine[];
}

