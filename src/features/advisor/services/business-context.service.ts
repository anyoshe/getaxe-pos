import { dashboardService } from "@/features/dashboard/services/dashboard.service";

/** Compact, tenant-scoped facts for the advisor (no free-form DB access). */
export type BusinessAdvisorContext = {
  asOf: string;
  salesToday: number;
  salesTodayCount: number;
  customers: number;
  products: number;
  lowStockCount: number;
  lowStockNames: string[];
  cashTotal: number;
  openAr: number;
  openAp: number;
  stockValue: number;
  grossProfitMonth: number;
  grossProfitToday: number;
  revenueMonth: number;
  topProfit: { name: string; margin: number }[];
  losses: { name: string; margin: number }[];
  expiring: { name: string; expiryDate: string; qty: number }[];
  slowStock: { name: string; qty: number }[];
  attentionTitles: string[];
};

export async function buildBusinessAdvisorContext(
  businessId: string,
): Promise<BusinessAdvisorContext> {
  const dash = await dashboardService.getOwnerDashboard(businessId);
  const topProfit = (dash.topProfitProducts ?? []).map((p) => ({
    name: p.name,
    margin: p.margin,
  }));
  const losses = (dash.lossProducts ?? []).map((p) => ({
    name: p.name,
    margin: p.margin,
  }));

  return {
    asOf: new Date().toISOString(),
    salesToday: Number(dash.summary.todaySales ?? 0),
    salesTodayCount: Number(dash.summary.todaySalesCount ?? 0),
    customers: Number(dash.summary.customers ?? 0),
    products: Number(dash.summary.products ?? 0),
    lowStockCount: Number(dash.summary.lowStock ?? 0),
    lowStockNames: (dash.lowStockItems ?? []).slice(0, 8).map((i) => i.name),
    cashTotal: Number(dash.summary.cashTotal ?? 0),
    openAr: Number(dash.summary.openAr ?? 0),
    openAp: Number(dash.summary.openAp ?? 0),
    stockValue: Number(dash.summary.stockValue ?? 0),
    grossProfitMonth: Number(dash.summary.grossProfitMonth ?? 0),
    grossProfitToday: Number(dash.summary.grossProfitToday ?? 0),
    revenueMonth: Number(dash.summary.revenueMonth ?? 0),
    topProfit,
    losses,
    expiring: (dash.expiringBatches ?? []).slice(0, 6).map((b) => ({
      name: b.productName,
      expiryDate: b.expiryDate,
      qty: b.quantityRemaining,
    })),
    slowStock: (dash.slowProducts ?? []).slice(0, 6).map((s) => ({
      name: s.name,
      qty: s.quantity,
    })),
    attentionTitles: (dash.attention ?? []).map((a) => a.title),
  };
}

export function formatContextForPrompt(ctx: BusinessAdvisorContext): string {
  return JSON.stringify(ctx, null, 2);
}
