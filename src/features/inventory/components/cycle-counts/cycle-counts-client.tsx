"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  startCycleCountAction,
  cancelCycleCountAction,
} from "../../actions/cycle-count";

type Warehouse = { id: string; name: string; code?: string | null };
type CountRow = {
  id: string;
  status: string;
  reference: string | null;
  notes: string | null;
  warehouseId: string;
  warehouseName: string;
  startedAt: Date | string;
  completedAt: Date | string | null;
  itemCount: number;
};

export function CycleCountsClient({
  warehouses,
  counts,
}: {
  warehouses: Warehouse[];
  counts: CountRow[];
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [warehouseId, setWarehouseId] = useState(warehouses[0]?.id ?? "");
  const [reference, setReference] = useState("");
  const [notes, setNotes] = useState("");

  const open = useMemo(
    () => counts.filter((c) => c.status === "IN_PROGRESS" || c.status === "DRAFT"),
    [counts],
  );

  function onStart() {
    if (!warehouseId) {
      toast.error("Select a warehouse.");
      return;
    }
    start(async () => {
      const r = await startCycleCountAction({
        warehouseId,
        reference: reference || null,
        notes: notes || null,
      });
      if (!r.success) {
        toast.error(r.message);
        return;
      }
      toast.success(r.message);
      if (r.id) router.push(`/inventory/cycle-counts/${r.id}`);
      else router.refresh();
    });
  }

  function onCancel(id: string) {
    start(async () => {
      const r = await cancelCycleCountAction(id);
      if (!r.success) toast.error(r.message);
      else {
        toast.success(r.message);
        router.refresh();
      }
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-primary">
            Inventory
          </p>
          <h1 className="text-2xl font-semibold tracking-tight">Cycle counts</h1>
          <p className="text-sm text-muted-foreground">
            Snapshot on-hand stock, enter physical counts, then post variances as
            adjustments. Requires capability{" "}
            <code className="text-xs">inventory.cycle-count</code>.
          </p>
        </div>
      </div>

      <div className="rounded-xl border bg-card p-4 space-y-3">
        <h2 className="font-medium">Start a count</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <label className="space-y-1 text-sm">
            <span className="text-muted-foreground">Warehouse</span>
            <select
              className="flex h-10 w-full rounded-lg border border-input bg-background px-3 text-sm"
              value={warehouseId}
              onChange={(e) => setWarehouseId(e.target.value)}
            >
              {warehouses.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.name}
                  {w.code ? ` (${w.code})` : ""}
                </option>
              ))}
            </select>
          </label>
          <label className="space-y-1 text-sm">
            <span className="text-muted-foreground">Reference</span>
            <Input
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              placeholder="CC-2026-001"
            />
          </label>
          <label className="space-y-1 text-sm sm:col-span-2">
            <span className="text-muted-foreground">Notes</span>
            <Input
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Optional"
            />
          </label>
        </div>
        <Button type="button" disabled={pending || !warehouseId} onClick={onStart}>
          {pending ? "Starting…" : "Start cycle count"}
        </Button>
        {open.length > 0 ? (
          <p className="text-xs text-muted-foreground">
            {open.length} open count(s). Finish or cancel them before starting
            another for the same warehouse if you want a clean snapshot.
          </p>
        ) : null}
      </div>

      <div className="overflow-x-auto rounded-xl border">
        <table className="w-full min-w-[640px] text-sm">
          <thead className="bg-muted/50 text-left">
            <tr>
              <th className="p-3 font-medium">Reference</th>
              <th className="p-3 font-medium">Warehouse</th>
              <th className="p-3 font-medium">Status</th>
              <th className="p-3 font-medium text-right">Lines</th>
              <th className="p-3 font-medium">Started</th>
              <th className="p-3 font-medium" />
            </tr>
          </thead>
          <tbody>
            {counts.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-muted-foreground">
                  No cycle counts yet.
                </td>
              </tr>
            ) : (
              counts.map((c) => (
                <tr key={c.id} className="border-t">
                  <td className="p-3 font-medium">
                    {c.reference || c.id.slice(0, 8)}
                  </td>
                  <td className="p-3 text-muted-foreground">{c.warehouseName}</td>
                  <td className="p-3">
                    <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium">
                      {c.status}
                    </span>
                  </td>
                  <td className="p-3 text-right tabular-nums">{c.itemCount}</td>
                  <td className="p-3 text-muted-foreground text-xs">
                    {new Date(c.startedAt).toLocaleString()}
                  </td>
                  <td className="p-3 text-right space-x-2">
                    <Link
                      href={`/inventory/cycle-counts/${c.id}`}
                      className="text-sm font-medium text-primary hover:underline"
                    >
                      Open
                    </Link>
                    {(c.status === "IN_PROGRESS" || c.status === "DRAFT") && (
                      <button
                        type="button"
                        className="text-sm text-destructive hover:underline"
                        disabled={pending}
                        onClick={() => onCancel(c.id)}
                      >
                        Cancel
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
