/**
 * Phase C — draft purchase order(s) from restock / low-stock lines.
 * Proposes quantities; create runs only after user confirm via server action.
 */

import { eq } from "drizzle-orm";

import { db } from "@/db";
import { suppliers } from "@/db/schema/inventory/suppliers";
import {
  loadAttentionBundle,
  type RestockLine,
} from "@/features/dashboard/services/attention.service";
import { createPurchaseOrderAction } from "@/features/purchases/actions/purchasing-ui";

export type RestockPoDraftGroup = {
  supplierId: string | null;
  supplierName: string;
  lines: {
    productId: string;
    name: string;
    sku: string | null;
    onHand: number;
    reorderLevel: number;
    orderQty: number;
    unitCost: number;
  }[];
  estimatedTotal: number;
};

export type RestockPoDraft = {
  groups: RestockPoDraftGroup[];
  totalLines: number;
  missingSupplierLines: number;
  fallbackSupplierId: string | null;
  fallbackSupplierName: string | null;
};

function money(n: number) {
  return `KES ${Math.round(n).toLocaleString("en-KE")}`;
}

export function parseRestockPoIntent(question: string): boolean {
  const q = question.toLowerCase().trim();
  return (
    /(draft|create|raise|make|generate).{0,20}(po|purchase\s*order|order)/.test(
      q,
    ) ||
    /(restock|reorder|low\s*stock).{0,30}(po|purchase|order)/.test(q) ||
    /purchase\s*order\s*from\s*restock/.test(q) ||
    /order\s*what\s*(is\s*)?(low|short)/.test(q) ||
    /^restock\s*(po|order)?$/.test(q)
  );
}

export async function buildRestockPoDraft(
  businessId: string,
): Promise<RestockPoDraft> {
  const bundle = await loadAttentionBundle(businessId, "restock");
  const lines = bundle.restock ?? [];

  const supplierRows = await db
    .select({ id: suppliers.id, name: suppliers.name })
    .from(suppliers)
    .where(eq(suppliers.businessId, businessId))
    .catch(() => [] as { id: string; name: string }[]);

  const fallback = supplierRows[0] ?? null;
  const nameById = new Map(supplierRows.map((s) => [s.id, s.name]));

  // Enrich supplier names if missing
  for (const line of lines) {
    if (line.supplierId && !line.supplierName) {
      line.supplierName = nameById.get(line.supplierId) ?? null;
    }
  }

  const groupsMap = new Map<string, RestockPoDraftGroup>();
  let missingSupplierLines = 0;

  for (const line of lines) {
    let sid = line.supplierId;
    let sname = line.supplierName;
    if (!sid) {
      missingSupplierLines += 1;
      if (fallback) {
        sid = fallback.id;
        sname = fallback.name;
      }
    }
    const key = sid ?? "__none__";
    const g = groupsMap.get(key) ?? {
      supplierId: sid,
      supplierName: sname ?? (sid ? "Supplier" : "No supplier"),
      lines: [],
      estimatedTotal: 0,
    };
    const orderQty = Math.max(1, Number(line.suggestedOrderQty) || 1);
    const unitCost = Math.max(0, Number(line.costPrice) || 0);
    g.lines.push({
      productId: line.productId,
      name: line.name,
      sku: line.sku,
      onHand: line.quantity,
      reorderLevel: line.reorderLevel,
      orderQty,
      unitCost,
    });
    g.estimatedTotal += orderQty * unitCost;
    groupsMap.set(key, g);
  }

  return {
    groups: [...groupsMap.values()].sort((a, b) =>
      a.supplierName.localeCompare(b.supplierName),
    ),
    totalLines: lines.length,
    missingSupplierLines,
    fallbackSupplierId: fallback?.id ?? null,
    fallbackSupplierName: fallback?.name ?? null,
  };
}

export function formatRestockPoDraftMessage(draft: RestockPoDraft): string {
  if (draft.totalLines === 0) {
    return (
      "**Restock PO draft**\n\n" +
      "No products are at or below reorder level right now. " +
      "Nothing to put on a purchase order from restock."
    );
  }

  const creatable = draft.groups.filter((g) => g.supplierId);
  const lines: string[] = [
    "**Restock → purchase order draft**",
    "",
    `${draft.totalLines} low-stock product(s) · ${creatable.length} supplier group(s) ready to order.`,
  ];

  if (draft.missingSupplierLines > 0 && draft.fallbackSupplierName) {
    lines.push(
      `_${draft.missingSupplierLines} line(s) had no preferred supplier — assigned to **${draft.fallbackSupplierName}** for this draft._`,
    );
  } else if (draft.missingSupplierLines > 0 && !draft.fallbackSupplierId) {
    lines.push(
      `**${draft.missingSupplierLines} line(s) have no supplier** and you have no suppliers set up. Add a supplier first, then ask again.`,
    );
  }

  lines.push("");

  for (const g of draft.groups) {
    lines.push(
      `### ${g.supplierName}` +
        (g.supplierId ? "" : " _(cannot create — missing supplier)_"),
    );
    for (const l of g.lines.slice(0, 12)) {
      lines.push(
        `- **${l.name}**` +
          (l.sku ? ` (${l.sku})` : "") +
          ` · on hand ${l.onHand} · reorder ${l.reorderLevel} → **order ${l.orderQty}**` +
          (l.unitCost > 0 ? ` @ ${money(l.unitCost)}` : ""),
      );
    }
    if (g.lines.length > 12) {
      lines.push(`- …and ${g.lines.length - 12} more line(s)`);
    }
    lines.push(`_Group estimate: ${money(g.estimatedTotal)}_`);
    lines.push("");
  }

  if (creatable.length > 0) {
    lines.push(
      "Tap **Create draft PO(s)** below to save as **DRAFT** purchase order(s) in Purchasing. " +
        "You can still edit, approve, then receive goods.",
    );
  }

  return lines.join("\n");
}

export function restockPoDraftActions(draft: RestockPoDraft): {
  label: string;
  href?: string;
  /** Client runs createRestockDraftPosAction */
  createRestockPo?: boolean;
}[] {
  const actions: {
    label: string;
    href?: string;
    createRestockPo?: boolean;
  }[] = [];

  if (draft.groups.some((g) => g.supplierId && g.lines.length > 0)) {
    actions.push({
      label: "Create draft PO(s)",
      createRestockPo: true,
    });
  }

  actions.push({
    label: "Restock list",
    href: "/dashboard/attention?kind=restock",
  });
  actions.push({
    label: "Purchase orders",
    href: "/purchases/orders",
  });
  if (!draft.fallbackSupplierId && draft.missingSupplierLines > 0) {
    actions.push({ label: "Add suppliers", href: "/inventory/suppliers" });
  }
  return actions;
}

/** Create one DRAFT PO per supplier group that has a supplierId. */
export async function createRestockDraftPurchaseOrders(
  businessId: string,
): Promise<{
  success: boolean;
  message: string;
  orderNumbers: string[];
  orderIds: string[];
}> {
  const draft = await buildRestockPoDraft(businessId);
  const creatable = draft.groups.filter(
    (g) => g.supplierId && g.lines.length > 0,
  );

  if (creatable.length === 0) {
    return {
      success: false,
      message:
        draft.totalLines === 0
          ? "No low-stock lines to order."
          : "Cannot create PO: set preferred suppliers on products or add a supplier.",
      orderNumbers: [],
      orderIds: [],
    };
  }

  const orderNumbers: string[] = [];
  const orderIds: string[] = [];
  const errors: string[] = [];

  for (const g of creatable) {
    const result = await createPurchaseOrderAction({
      supplierId: g.supplierId!,
      notes: `Advisor restock draft · ${g.lines.length} line(s)`,
      items: g.lines.map((l) => ({
        productId: l.productId,
        quantity: l.orderQty,
        unitCost: l.unitCost,
        unitId: null,
      })),
    });
    if (result.success) {
      if (result.orderNumber) orderNumbers.push(result.orderNumber);
      if (result.orderId) orderIds.push(result.orderId);
    } else {
      errors.push(
        `${g.supplierName}: ${result.message ?? "failed"}`,
      );
    }
  }

  if (orderNumbers.length === 0) {
    return {
      success: false,
      message: errors[0] ?? "Could not create purchase orders.",
      orderNumbers: [],
      orderIds: [],
    };
  }

  return {
    success: true,
    message:
      `Created draft PO(s): **${orderNumbers.join(", ")}**. ` +
      `Review under Purchase orders, approve, then receive stock.` +
      (errors.length ? ` Some groups failed: ${errors.join("; ")}` : ""),
    orderNumbers,
    orderIds,
  };
}

/** Lightweight list for narrative without full draft build in diagnose — optional */
export function summarizeRestockLines(lines: RestockLine[]): string {
  if (!lines.length) return "No low-stock products.";
  return lines
    .slice(0, 5)
    .map((l) => `${l.name} (order ~${l.suggestedOrderQty})`)
    .join("; ");
}
