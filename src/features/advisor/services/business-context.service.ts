import { eq } from "drizzle-orm";

import { db } from "@/db";
import { businesses } from "@/db/schema/core/businesses";
import { dashboardService } from "@/features/dashboard/services/dashboard.service";
import { getSetupReadiness } from "@/features/settings/services/setup-readiness.service";
import {
  buildSetupCoachSnapshot,
  type SetupCoachSnapshot,
} from "./setup-coach";

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
  /** Phase A setup */
  businessName: string | null;
  businessType: string | null;
  setup: SetupCoachSnapshot;
};

export async function buildBusinessAdvisorContext(
  businessId: string,
): Promise<BusinessAdvisorContext> {
  const [dash, readiness, business] = await Promise.all([
    dashboardService.getOwnerDashboard(businessId).catch(() => null),
    getSetupReadiness(businessId).catch(() => ({
      score: 0,
      checks: [],
      requiredDone: 0,
      requiredTotal: 0,
    })),
    db
      .select({
        name: businesses.name,
        businessType: businesses.businessType,
      })
      .from(businesses)
      .where(eq(businesses.id, businessId))
      .limit(1)
      .then((r) => r[0] ?? null)
      .catch(() => null),
  ]);

  const topProfit = (dash?.topProfitProducts ?? []).map((p) => ({
    name: p.name,
    margin: p.margin,
  }));
  const losses = (dash?.lossProducts ?? []).map((p) => ({
    name: p.name,
    margin: p.margin,
  }));

  const setup = buildSetupCoachSnapshot({
    businessName: business?.name ?? null,
    businessType: business?.businessType ?? null,
    score: readiness.score,
    requiredDone: readiness.requiredDone,
    requiredTotal: readiness.requiredTotal,
    checks: readiness.checks,
  });

  return {
    asOf: new Date().toISOString(),
    salesToday: Number(dash?.summary.todaySales ?? 0),
    salesTodayCount: Number(dash?.summary.todaySalesCount ?? 0),
    customers: Number(dash?.summary.customers ?? 0),
    products: Number(dash?.summary.products ?? 0),
    lowStockCount: Number(dash?.summary.lowStock ?? 0),
    lowStockNames: (dash?.lowStockItems ?? []).slice(0, 8).map((i) => i.name),
    cashTotal: Number(dash?.summary.cashTotal ?? 0),
    openAr: Number(dash?.summary.openAr ?? 0),
    openAp: Number(dash?.summary.openAp ?? 0),
    stockValue: Number(dash?.summary.stockValue ?? 0),
    grossProfitMonth: Number(dash?.summary.grossProfitMonth ?? 0),
    grossProfitToday: Number(dash?.summary.grossProfitToday ?? 0),
    revenueMonth: Number(dash?.summary.revenueMonth ?? 0),
    topProfit,
    losses,
    expiring: (dash?.expiringBatches ?? []).slice(0, 6).map((b) => ({
      name: b.productName,
      expiryDate: b.expiryDate,
      qty: b.quantityRemaining,
    })),
    slowStock: (dash?.slowProducts ?? []).slice(0, 6).map((s) => ({
      name: s.name,
      qty: s.quantity,
    })),
    attentionTitles: (dash?.attention ?? []).map((a) => a.title),
    businessName: business?.name ?? null,
    businessType: business?.businessType ?? null,
    setup,
  };
}

export function formatContextForPrompt(ctx: BusinessAdvisorContext): string {
  const { setup, ...rest } = ctx;
  return JSON.stringify(
    {
      ...rest,
      setup: {
        vertical: setup.vertical,
        verticalLabel: setup.verticalLabel,
        score: setup.score,
        requiredDone: setup.requiredDone,
        requiredTotal: setup.requiredTotal,
        isSetupComplete: setup.isSetupComplete,
        next: setup.next
          ? {
              id: setup.next.id,
              label: setup.next.label,
              href: setup.next.href,
            }
          : null,
        incomplete: setup.incomplete.slice(0, 8).map((c) => ({
          id: c.id,
          label: c.label,
          href: c.href,
        })),
      },
    },
    null,
    2,
  );
}
