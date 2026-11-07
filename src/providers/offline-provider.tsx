"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { toast } from "sonner";

import {
  OUTBOX_MAX_ATTEMPTS,
  outboxList,
  outboxRemove,
  outboxUpdate,
  type OutboxItem,
} from "@/lib/offline/outbox";
import { createSaleAction } from "@/features/sales/actions/create-sale";
import { ensurePosCustomerAction } from "@/features/sales/actions/pos-customer";

type OfflineContextValue = {
  online: boolean;
  pendingCount: number;
  pending: OutboxItem[];
  refreshOutbox: () => Promise<void>;
  flushOutbox: () => Promise<void>;
};

const OfflineContext = createContext<OfflineContextValue>({
  online: true,
  pendingCount: 0,
  pending: [],
  refreshOutbox: async () => {},
  flushOutbox: async () => {},
});

export function useOffline() {
  return useContext(OfflineContext);
}

export function OfflineProvider({ children }: { children: React.ReactNode }) {
  const [online, setOnline] = useState(true);
  const [pending, setPending] = useState<OutboxItem[]>([]);
  const [flushing, setFlushing] = useState(false);

  const refreshOutbox = useCallback(async () => {
    try {
      const items = await outboxList();
      setPending(items);
    } catch {
      setPending([]);
    }
  }, []);

  const flushOutbox = useCallback(async () => {
    if (flushing) return;
    if (typeof navigator !== "undefined" && !navigator.onLine) return;
    setFlushing(true);
    try {
      const items = await outboxList();
      if (items.length === 0) {
        setPending([]);
        return;
      }
      let ok = 0;
      let fail = 0;
      for (const item of items) {
        if (item.type !== "create_sale") continue;
        if (item.status === "failed" && item.attempts >= OUTBOX_MAX_ATTEMPTS) {
          continue;
        }
        try {
          let customerId = item.payload.customerId;
          if (item.payload.pendingCustomer?.phone) {
            const ensured = await ensurePosCustomerAction({
              phone: item.payload.pendingCustomer.phone,
              firstName: item.payload.pendingCustomer.firstName,
            });
            if (!ensured.success) {
              throw new Error(ensured.message);
            }
            customerId = ensured.customerId;
          }
          const clientSaleId = item.payload.clientSaleId || item.id;
          const result = await createSaleAction({
            warehouseId: item.payload.warehouseId,
            branchId: item.payload.branchId,
            customerId,
            notes: item.payload.notes,
            paymentMethod: item.payload.paymentMethod,
            cashAccountId: item.payload.cashAccountId ?? null,
            paymentReference: item.payload.paymentReference ?? null,
            paymentDetail: item.payload.paymentDetail ?? null,
            items: item.payload.items,
            clientSaleId,
          });
          if (!result.success) {
            throw new Error(result.message);
          }
          await outboxRemove(item.id);
          ok += 1;
        } catch (e) {
          const attempts = (item.attempts ?? 0) + 1;
          const lastError = e instanceof Error ? e.message : String(e);
          await outboxUpdate({
            ...item,
            attempts,
            lastError,
            status: attempts >= OUTBOX_MAX_ATTEMPTS ? "failed" : "pending",
          });
          fail += 1;
        }
      }
      await refreshOutbox();
      if (ok > 0) {
        toast.success(
          ok === 1 ? "1 offline sale synced" : `${ok} offline sales synced`,
        );
      }
      if (fail > 0 && ok === 0) {
        toast.error(
          "Could not sync offline sales yet — will retry when the network is stable.",
        );
      }
    } finally {
      setFlushing(false);
    }
  }, [flushing, refreshOutbox]);

  useEffect(() => {
    const onOnline = () => {
      setOnline(true);
      void flushOutbox();
    };
    const onOffline = () => setOnline(false);
    setOnline(typeof navigator !== "undefined" ? navigator.onLine : true);
    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);
    void refreshOutbox();
    const interval = window.setInterval(() => {
      if (navigator.onLine) void flushOutbox();
    }, 45_000);
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }
    return () => {
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
      window.clearInterval(interval);
    };
  }, [flushOutbox, refreshOutbox]);

  const value = useMemo(
    () => ({
      online,
      pendingCount: pending.filter(
        (p) =>
          p.status !== "failed" || (p.attempts ?? 0) < OUTBOX_MAX_ATTEMPTS,
      ).length,
      pending,
      refreshOutbox,
      flushOutbox,
    }),
    [online, pending, refreshOutbox, flushOutbox],
  );

  return (
    <OfflineContext.Provider value={value}>{children}</OfflineContext.Provider>
  );
}
