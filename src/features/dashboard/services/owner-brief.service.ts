import type { OwnerDashboard } from "../types";

export type OwnerBriefPriority = {
  rank: number;
  title: string;
  detail: string;
  href: string;
  tone: "critical" | "warning" | "info" | "positive";
};

export type DailyOwnerBrief = {
  /** Nairobi-oriented greeting line */
  headline: string;
  /** One short paragraph in plain language */
  narrative: string;
  /** Ordered actions for today */
  priorities: OwnerBriefPriority[];
  /** Snapshot numbers for the strip */
  snapshot: {
    todaySales: number;
    todaySalesCount: number;
    grossProfitToday: number;
    cashTotal: number;
    openAr: number;
    openAp: number;
    lowStock: number;
    expiringBatches: number;
  };
  generatedAt: string;
};

function money(n: number): string {
  return `KES ${Number(n || 0).toLocaleString(undefined, {
    maximumFractionDigits: 0,
  })}`;
}

/**
 * Daily owner brief — medium plain language:
 * clear for a busy shop owner, not childish, not accounting jargon.
 */
export function buildDailyOwnerBrief(
  dashboard: OwnerDashboard,
  opts?: { ownerName?: string | null; businessName?: string | null },
): DailyOwnerBrief {
  const s = dashboard.summary;
  const todaySales = Number(s.todaySales ?? 0);
  const todayCount = Number(s.todaySalesCount ?? 0);
  const gpToday = Number(s.grossProfitToday ?? 0);
  const cash = Number(s.cashTotal ?? 0);
  const ar = Number(s.openAr ?? 0);
  const ap = Number(s.openAp ?? 0);
  const low = Number(s.lowStock ?? 0);
  const expiring = dashboard.expiringBatches?.length ?? 0;
  const lossCount =
    dashboard.lossSaleLines?.length ?? dashboard.lossProducts?.length ?? 0;

  const firstName = opts?.ownerName?.trim().split(/\s+/)[0] || "there";
  const shop = opts?.businessName?.trim() || "your business";

  const priorities: OwnerBriefPriority[] = [];

  if (low > 0) {
    priorities.push({
      rank: priorities.length + 1,
      title: `${low} item${low === 1 ? "" : "s"} running low`,
      detail:
        dashboard.lowStockItems
          ?.slice(0, 3)
          .map((p) => p.name)
          .join(", ") || "Order stock before the shelf goes empty.",
      href: "/dashboard/attention?kind=restock",
      tone: "critical",
    });
  }

  if (expiring > 0) {
    priorities.push({
      rank: priorities.length + 1,
      title: `${expiring} batch${expiring === 1 ? "" : "es"} near expiry`,
      detail: "Sell older stock first, discount, or write off. Avoid reordering the same lines yet.",
      href: "/dashboard/attention?kind=expiry",
      tone: "warning",
    });
  }

  if (ar > 0) {
    priorities.push({
      rank: priorities.length + 1,
      title: `Collect ${money(ar)} owed to you`,
      detail: `${s.openArCount || "Open"} credit sale${Number(s.openArCount) === 1 ? "" : "s"} still unpaid.`,
      href: "/sales/receivables",
      tone: "warning",
    });
  }

  if (ap > 0) {
    priorities.push({
      rank: priorities.length + 1,
      title: `Pay suppliers ${money(ap)}`,
      detail: "Clear supplier balances so deliveries and records stay up to date.",
      href: "/purchases/supplier-invoices",
      tone: "info",
    });
  }

  if (lossCount > 0) {
    priorities.push({
      rank: priorities.length + 1,
      title: "Some items sold at cost or loss",
      detail: "Check selling prices so the counter is not undercutting your cost.",
      href: "/dashboard/profit?period=month",
      tone: "warning",
    });
  }

  if (todayCount === 0 && priorities.length < 3) {
    priorities.push({
      rank: priorities.length + 1,
      title: "No sales completed today yet",
      detail: "If the shop is open, finish sales on the till so today’s totals stay accurate.",
      href: "/sales/pos",
      tone: "info",
    });
  }

  if (priorities.length === 0) {
    priorities.push({
      rank: 1,
      title: "Nothing urgent right now",
      detail: "Stock and cash look steady. Open the till when customers come in.",
      href: "/sales/pos",
      tone: "positive",
    });
  }

  const narrativeParts: string[] = [];
  narrativeParts.push(`Hi ${firstName} — here is ${shop} today.`);
  if (todayCount > 0) {
    narrativeParts.push(
      `Sales so far: ${money(todaySales)} from ${todayCount} sale${todayCount === 1 ? "" : "s"}. After stock cost, about ${money(gpToday)} kept.`,
    );
  } else {
    narrativeParts.push(
      `No completed sales in the system yet today. Cash and monthly figures below still reflect finished work.`,
    );
  }
  narrativeParts.push(
    `Cash & bank on hand: ${money(cash)}. Customers still owe you ${money(ar)}; you still owe suppliers ${money(ap)}.`,
  );
  if (low > 0 || expiring > 0) {
    narrativeParts.push(
      `Watch: ${low} low-stock item${low === 1 ? "" : "s"}${expiring > 0 ? ` and ${expiring} batch(es) near expiry` : ""}.`,
    );
  }

  const hour = new Date().getHours();
  const partOfDay =
    hour < 12 ? "morning" : hour < 17 ? "afternoon" : "evening";

  return {
    headline: `Good ${partOfDay}, ${firstName}`,
    narrative: narrativeParts.join(" "),
    priorities: priorities.slice(0, 6).map((p, i) => ({ ...p, rank: i + 1 })),
    snapshot: {
      todaySales,
      todaySalesCount: todayCount,
      grossProfitToday: gpToday,
      cashTotal: cash,
      openAr: ar,
      openAp: ap,
      lowStock: low,
      expiringBatches: expiring,
    },
    generatedAt: new Date().toISOString(),
  };
}
