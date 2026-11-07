/** Session key for dashboard restock → purchase order prefill (avoids long URLs). */
export const RESTOCK_PO_PREFILL_KEY = "getaxe:restock-po-prefill";

export type RestockPrefillLine = {
  productId: string;
  quantity: number;
  unitCost?: number;
  supplierId?: string | null;
};

export type RestockPrefillPayload = {
  lines: RestockPrefillLine[];
  /** Preferred supplier when all selected lines share one */
  supplierId?: string | null;
  note?: string;
  createdAt: number;
};

export function writeRestockPrefill(payload: RestockPrefillPayload): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(RESTOCK_PO_PREFILL_KEY, JSON.stringify(payload));
  } catch {
    /* quota / private mode */
  }
}

export function readRestockPrefill(): RestockPrefillPayload | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(RESTOCK_PO_PREFILL_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as RestockPrefillPayload;
    if (!parsed?.lines?.length) return null;
    // Discard stale payloads older than 1 hour
    if (Date.now() - (parsed.createdAt || 0) > 60 * 60 * 1000) {
      sessionStorage.removeItem(RESTOCK_PO_PREFILL_KEY);
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function clearRestockPrefill(): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.removeItem(RESTOCK_PO_PREFILL_KEY);
  } catch {
    /* ignore */
  }
}
