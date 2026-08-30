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
          const result = await createSaleAction({
            warehouseId: item.payload.warehouseId,
            branchId: item.payload.branchId,
            customerId,
            notes: item.payload.notes,
            paymentMethod: item.payload.paymentMethod,
            items: item.payload.items,
          });
          if (!result.success) {
            throw new Error(result.message);
          }
          await outboxRemove(item.id);
          ok += 1;
        } catch (e) {
          fail += 1;
          await outboxUpdate({
            ...item,
            attempts: (item.attempts ?? 0) + 1,
            lastError: e instanceof Error ? e.message : String(e),
          });
        }
      }
      await refreshOutbox();
      if (ok > 0) {
        toast.success(
          ok === 1
            ? "1 offline sale synced"
            : `${ok} offline sales synced`,
        );
      }
      if (fail > 0 && ok === 0) {
        toast.error(
          `${fail} offline sale(s) could not sync — check stock and try again`,
        );
      }
    } finally {
      setFlushing(false);
    }
  }, [flushing, refreshOutbox]);

  useEffect(() => {
    setOnline(typeof navigator !== "undefined" ? navigator.onLine : true);
    void refreshOutbox();

    const onOnline = () => {
      setOnline(true);
      toast.message("Back online — syncing pending sales…");
      void flushOutbox();
    };
    const onOffline = () => {
      setOnline(false);
      toast.message("You are offline — sales will queue and sync later");
    };
    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);

    // Service worker for shell cache (best-effort)
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }

    const interval = window.setInterval(() => {
      if (navigator.onLine) void flushOutbox();
    }, 30_000);

    return () => {
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
      window.clearInterval(interval);
    };
  }, [flushOutbox, refreshOutbox]);

  const value = useMemo(
    () => ({
      online,
      pendingCount: pending.length,
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
