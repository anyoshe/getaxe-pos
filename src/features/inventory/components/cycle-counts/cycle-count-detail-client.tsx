"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  saveCycleCountLineAction,
  completeCycleCountAction,
  cancelCycleCountAction,
} from "../../actions/cycle-count";

type Count = {
  id: string;
  status: string;
  reference: string | null;
  warehouseName: string;
  notes: string | null;
};

type Item = {
  id: string;
  productName: string;
  productSku: string | null;
  batchNumber: string | null;
  systemQuantity: string;
  countedQuantity: string | null;
  notes: string | null;
};

export function CycleCountDetailClient({
  count,
  items: initialItems,
}: {
  count: Count;
  items: Item[];
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [items, setItems] = useState(initialItems);
  const readonly = count.status === "COMPLETED" || count.status === "CANCELLED";

  const stats = useMemo(() => {
    let entered = 0;
    let variance = 0;
    for (const i of items) {
      if (i.countedQuantity != null && i.countedQuantity !== "") {
        entered++;
        variance += Number(i.countedQuantity) - Number(i.systemQuantity);
      }
    }
    return { entered, total: items.length, variance };
  }, [items]);

  function setCounted(id: string, value: string) {
    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, countedQuantity: value } : i)),
    );
  }

  function saveLine(item: Item) {
    const raw = item.countedQuantity;
    const num =
      raw == null || raw === "" ? null : Number(raw);
    start(async () => {
      const r = await saveCycleCountLineAction({
        itemId: item.id,
        countedQuantity: num,
      });
      if (!r.success) toast.error(r.message);
      else toast.success("Line saved");
    });
  }

  function fillSystem() {
    setItems((prev) =>
      prev.map((i) =>
        i.countedQuantity == null || i.countedQuantity === ""
          ? { ...i, countedQuantity: String(Number(i.systemQuantity)) }
          : i,
      ),
    );
  }

  function complete() {
    start(async () => {
      // persist any local edits first
      for (const item of items) {
        if (item.countedQuantity == null || item.countedQuantity === "") continue;
        await saveCycleCountLineAction({
          itemId: item.id,
          countedQuantity: Number(item.countedQuantity),
        });
      }
      const r = await completeCycleCountAction(count.id);
      if (!r.success) {
        toast.error(r.message);
        return;
      }
      toast.success(r.message);
      router.refresh();
    });
  }

  function cancel() {
    start(async () => {
      const r = await cancelCycleCountAction(count.id);
      if (!r.success) toast.error(r.message);
      else {
        toast.success(r.message);
        router.push("/inventory/cycle-counts");
      }
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <Link
            href="/inventory/cycle-counts"
            className="text-xs font-medium text-primary hover:underline"
          >
            ← Cycle counts
          </Link>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight">
            {count.reference || count.id.slice(0, 8)}
          </h1>
          <p className="text-sm text-muted-foreground">
            {count.warehouseName} · {count.status}
          </p>
        </div>
        {!readonly ? (
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="outline" disabled={pending} onClick={fillSystem}>
              Fill system qty
            </Button>
            <Button type="button" variant="outline" disabled={pending} onClick={cancel}>
              Cancel
            </Button>
            <Button type="button" disabled={pending} onClick={complete}>
              Complete &amp; post variances
            </Button>
          </div>
        ) : null}
      </div>

      <div className="flex flex-wrap gap-3 text-sm">
        <span className="rounded-full bg-muted px-3 py-1">
          {stats.entered}/{stats.total} counted
        </span>
        <span className="rounded-full bg-muted px-3 py-1 tabular-nums">
          Net variance (unsaved view): {stats.variance}
        </span>
      </div>

      <div className="overflow-x-auto rounded-xl border">
        <table className="w-full min-w-[720px] text-sm">
          <thead className="bg-muted/50 text-left">
            <tr>
              <th className="p-3 font-medium">Product</th>
              <th className="p-3 font-medium">Batch</th>
              <th className="p-3 font-medium text-right">System</th>
              <th className="p-3 font-medium text-right">Counted</th>
              <th className="p-3 font-medium text-right">Variance</th>
              {!readonly ? <th className="p-3 font-medium" /> : null}
            </tr>
          </thead>
          <tbody>
            {items.map((item) => {
              const sys = Number(item.systemQuantity);
              const cnt =
                item.countedQuantity == null || item.countedQuantity === ""
                  ? null
                  : Number(item.countedQuantity);
              const variance = cnt == null ? null : cnt - sys;
              return (
                <tr key={item.id} className="border-t">
                  <td className="p-3">
                    <div className="font-medium">{item.productName}</div>
                    {item.productSku ? (
                      <div className="text-xs text-muted-foreground font-mono">
                        {item.productSku}
                      </div>
                    ) : null}
                  </td>
                  <td className="p-3 text-muted-foreground text-xs">
                    {item.batchNumber || "—"}
                  </td>
                  <td className="p-3 text-right tabular-nums">{sys}</td>
                  <td className="p-3 text-right">
                    {readonly ? (
                      <span className="tabular-nums">{cnt ?? "—"}</span>
                    ) : (
                      <Input
                        type="number"
                        min={0}
                        step="any"
                        className="ml-auto h-9 w-28 text-right"
                        value={item.countedQuantity ?? ""}
                        onChange={(e) => setCounted(item.id, e.target.value)}
                        onBlur={() => saveLine(item)}
                      />
                    )}
                  </td>
                  <td
                    className={`p-3 text-right tabular-nums ${
                      variance == null
                        ? "text-muted-foreground"
                        : variance === 0
                          ? "text-muted-foreground"
                          : variance > 0
                            ? "text-chart-4"
                            : "text-destructive"
                    }`}
                  >
                    {variance == null ? "—" : variance > 0 ? `+${variance}` : variance}
                  </td>
                  {!readonly ? (
                    <td className="p-3 text-right">
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        disabled={pending}
                        onClick={() => saveLine(item)}
                      >
                        Save
                      </Button>
                    </td>
                  ) : null}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
