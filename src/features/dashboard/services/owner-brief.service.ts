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
 * Builds a daily “owner brief” from the same live dashboard payload —
 * no extra queries. Aimed at 10-second comprehension.
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
  const lossCount = dashboard.lossSaleLines?.length ?? dashboard.lossProducts?.length ?? 0;

  const firstName =
    opts?.ownerName?.trim().split(/\s+/)[0] || "there";
  const shop = opts?.businessName?.trim() || "your business";

  const priorities: OwnerBriefPriority[] = [];

  if (low > 0) {
    priorities.push({
      rank: priorities.length + 1,
      title: `${low} product${low === 1 ? "" : "s"} need restock`,
      detail:
        dashboard.lowStockItems
          ?.slice(0, 3)
          .map((p) => p.name)
          .join(", ") || "Open restock list and raise a PO before shelves empty.",
      href: "/dashboard/attention?kind=restock",
      tone: "critical",
    });
  }

  if (expiring > 0) {
    priorities.push({
      rank: priorities.length + 1,
      title: `${expiring} batch${expiring === 1 ? "" : "es"} near expiry`,
      detail:
        "Sell FEFO at the counter, promote, or write off — don’t reorder the same lines yet.",
      href: "/dashboard/attention?kind=expiry",
      tone: "warning",
    });
  }

  if (ar > 0) {
    priorities.push({
      rank: priorities.length + 1,
      title: `Collect ${money(ar)} in credit`,
      detail: `${s.openArCount || "Open"} invoice(s) on receivables.`,
      href: "/sales/receivables",
      tone: "warning",
    });
  }

  if (ap > 0) {
    priorities.push({
      rank: priorities.length + 1,
      title: `Pay suppliers ${money(ap)}`,
      detail: "Clear AP so GRNs and ageing stay truthful.",
      href: "/purchases/supplier-invoices",
      tone: "info",
    });
  }

  if (lossCount > 0) {
    priorities.push({
      rank: priorities.length + 1,
      title: "Lines sold at or below cost",
      detail:
        "Review price list / markup so the counter is not giving stock away.",
      href: "/dashboard/profit?period=month",
      tone: "warning",
    });
  }

  if (todayCount === 0 && priorities.length < 3) {
    priorities.push({
      rank: priorities.length + 1,
      title: "No completed sales recorded today yet",
      detail:
        "If the shop is open, ensure POS sales are completed so live numbers stay true.",
      href: "/sales/pos",
      tone: "info",
    });
  }

  if (priorities.length === 0) {
    priorities.push({
      rank: 1,
      title: "Nothing urgent flagged",
      detail:
        "Stock and money look steady. Spot-check tills and push high-margin lines at POS.",
      href: "/sales/pos",
      tone: "positive",
    });
  }

  const narrativeParts: string[] = [];
  narrativeParts.push(
    `Hi ${firstName} — snapshot for ${shop}.`,
  );
  if (todayCount > 0) {
    narrativeParts.push(
      `Today so far: ${money(todaySales)} across ${todayCount} sale${todayCount === 1 ? "" : "s"} (gross profit about ${money(gpToday)}).`,
    );
  } else {
    narrativeParts.push(
      `Today’s sales in the system are still ${money(0)}; month and cash figures below are live from completed work.`,
    );
  }
  narrativeParts.push(
    `Cash & bank across tills: ${money(cash)}. Open AR ${money(ar)} · open AP ${money(ap)}.`,
  );
  if (low > 0 || expiring > 0) {
    narrativeParts.push(
      `Attention: ${low} low-stock line${low === 1 ? "" : "s"}${expiring > 0 ? ` and ${expiring} batch(es) near expiry` : ""}.`,
    );
  }

  const hour = new Date().getHours();
  const timeWord =
    hour < 12 ? "Morning" : hour < 17 ? "Afternoon" : "Evening";

  return {
    headline: `${timeWord} brief · what matters today`,
    narrative: narrativeParts.join(" "),
    priorities: priorities.slice(0, 5),
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
