"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { completeDispenseAction } from "../actions/dispensing";

type Warehouse = { id: string; name: string };
type Medicine = {
  id: string;
  name: string;
  sku: string | null;
  genericName: string | null;
};
type BatchOpt = {
  productId: string;
  batchId: string;
  batchNumber: string;
  expiryDate: string | null;
  quantity: number;
  warehouseId: string;
};
type HistoryRow = {
  id: string;
  status: string;
  patientName: string | null;
  prescriptionRef: string | null;
  warehouseName: string;
  dispensedAt: Date | string | null;
  createdAt: Date | string;
};

type Line = {
  key: string;
  productId: string;
  batchId: string;
  quantity: string;
  dosageInstructions: string;
};

export function DispensingClient({
  warehouses,
  medicines,
  batches,
  history,
}: {
  warehouses: Warehouse[];
  medicines: Medicine[];
  batches: BatchOpt[];
  history: HistoryRow[];
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [warehouseId, setWarehouseId] = useState(warehouses[0]?.id ?? "");
  const [patientName, setPatientName] = useState("");
  const [prescriptionRef, setPrescriptionRef] = useState("");
  const [query, setQuery] = useState("");
  const [lines, setLines] = useState<Line[]>([]);

  const filteredMeds = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return medicines.slice(0, 30);
    return medicines
      .filter(
        (m) =>
          m.name.toLowerCase().includes(q) ||
          (m.sku ?? "").toLowerCase().includes(q) ||
          (m.genericName ?? "").toLowerCase().includes(q),
      )
      .slice(0, 30);
  }, [medicines, query]);

  function batchesFor(productId: string) {
    return batches
      .filter(
        (b) =>
          b.productId === productId &&
          b.warehouseId === warehouseId &&
          b.quantity > 0,
      )
      .sort((a, b) => {
        const ea = a.expiryDate || "9999";
        const eb = b.expiryDate || "9999";
        return ea.localeCompare(eb);
      });
  }

  function addProduct(m: Medicine) {
    const avail = batchesFor(m.id);
    if (avail.length === 0) {
      toast.error(`No stock for ${m.name} in this warehouse.`);
      return;
    }
    const first = avail[0];
    setLines((prev) => [
      ...prev,
      {
        key: `${m.id}-${Date.now()}`,
        productId: m.id,
        batchId: first.batchId,
        quantity: "1",
        dosageInstructions: "",
      },
    ]);
  }

  function updateLine(key: string, patch: Partial<Line>) {
    setLines((prev) =>
      prev.map((l) => (l.key === key ? { ...l, ...patch } : l)),
    );
  }

  function removeLine(key: string) {
    setLines((prev) => prev.filter((l) => l.key !== key));
  }

  function complete() {
    start(async () => {
      const r = await completeDispenseAction({
        warehouseId,
        patientName: patientName || null,
        prescriptionRef: prescriptionRef || null,
        items: lines.map((l) => ({
          productId: l.productId,
          batchId: l.batchId,
          quantity: Number(l.quantity),
          dosageInstructions: l.dosageInstructions || null,
        })),
      });
      if (!r.success) {
        toast.error(r.message);
        return;
      }
      toast.success(r.message);
      setLines([]);
      setPatientName("");
      setPrescriptionRef("");
      router.refresh();
    });
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-primary">
          Pharmacy
        </p>
        <h1 className="text-2xl font-semibold tracking-tight">Dispensing</h1>
        <p className="text-sm text-muted-foreground">
          Dispense medicines from stock (FEFO batch preference). Optional patient
          name / Rx reference for the record. Stock is reduced via the inventory
          engine.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="space-y-3 rounded-xl border bg-card p-4">
          <h2 className="font-medium">Dispense</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="space-y-1 text-sm sm:col-span-2">
              <span className="text-muted-foreground">Warehouse</span>
              <select
                className="flex h-10 w-full rounded-lg border border-input bg-background px-3 text-sm"
                value={warehouseId}
                onChange={(e) => {
                  setWarehouseId(e.target.value);
                  setLines([]);
                }}
              >
                {warehouses.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="space-y-1 text-sm">
              <span className="text-muted-foreground">Patient (optional)</span>
              <Input
                value={patientName}
                onChange={(e) => setPatientName(e.target.value)}
                placeholder="Name"
              />
            </label>
            <label className="space-y-1 text-sm">
              <span className="text-muted-foreground">Rx ref (optional)</span>
              <Input
                value={prescriptionRef}
                onChange={(e) => setPrescriptionRef(e.target.value)}
                placeholder="RX-001"
              />
            </label>
          </div>

          <Input
            placeholder="Search medicine name / SKU / generic…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <div className="max-h-40 overflow-y-auto rounded-lg border divide-y">
            {filteredMeds.map((m) => (
              <button
                key={m.id}
                type="button"
                className="flex w-full items-center justify-between px-3 py-2 text-left text-sm hover:bg-muted"
                onClick={() => addProduct(m)}
              >
                <span>
                  <span className="font-medium">{m.name}</span>
                  {m.genericName ? (
                    <span className="ml-2 text-xs text-muted-foreground">
                      {m.genericName}
                    </span>
                  ) : null}
                </span>
                <span className="text-xs text-primary">Add</span>
              </button>
            ))}
          </div>

          {lines.length > 0 ? (
            <div className="space-y-3">
              {lines.map((line) => {
                const med = medicines.find((m) => m.id === line.productId);
                const opts = batchesFor(line.productId);
                return (
                  <div
                    key={line.key}
                    className="rounded-lg border p-3 space-y-2 text-sm"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{med?.name}</span>
                      <button
                        type="button"
                        className="text-xs text-destructive"
                        onClick={() => removeLine(line.key)}
                      >
                        Remove
                      </button>
                    </div>
                    <div className="grid gap-2 sm:grid-cols-3">
                      <label className="space-y-1">
                        <span className="text-xs text-muted-foreground">
                          Batch (FEFO)
                        </span>
                        <select
                          className="flex h-9 w-full rounded-md border border-input bg-background px-2 text-sm"
                          value={line.batchId}
                          onChange={(e) =>
                            updateLine(line.key, { batchId: e.target.value })
                          }
                        >
                          {opts.map((b) => (
                            <option key={b.batchId} value={b.batchId}>
                              {b.batchNumber}
                              {b.expiryDate ? ` exp ${b.expiryDate}` : ""} ·{" "}
                              {b.quantity}
                            </option>
                          ))}
                        </select>
                      </label>
                      <label className="space-y-1">
                        <span className="text-xs text-muted-foreground">Qty</span>
                        <Input
                          type="number"
                          min={0.0001}
                          step="any"
                          value={line.quantity}
                          onChange={(e) =>
                            updateLine(line.key, { quantity: e.target.value })
                          }
                        />
                      </label>
                      <label className="space-y-1">
                        <span className="text-xs text-muted-foreground">
                          Directions
                        </span>
                        <Input
                          value={line.dosageInstructions}
                          onChange={(e) =>
                            updateLine(line.key, {
                              dosageInstructions: e.target.value,
                            })
                          }
                          placeholder="1 tab TDS × 5 days"
                        />
                      </label>
                    </div>
                  </div>
                );
              })}
              <Button
                type="button"
                className="w-full"
                disabled={pending}
                onClick={complete}
              >
                {pending ? "Dispensing…" : "Complete dispense"}
              </Button>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Search and add medicines to start.
            </p>
          )}
        </div>

        <div className="rounded-xl border bg-card p-4">
          <h2 className="font-medium mb-3">Recent dispensings</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-muted-foreground">
                <tr>
                  <th className="pb-2 font-medium">When</th>
                  <th className="pb-2 font-medium">Patient</th>
                  <th className="pb-2 font-medium">Rx</th>
                  <th className="pb-2 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {history.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-6 text-muted-foreground">
                      No dispensings yet.
                    </td>
                  </tr>
                ) : (
                  history.slice(0, 20).map((h) => (
                    <tr key={h.id} className="border-t">
                      <td className="py-2 text-xs text-muted-foreground">
                        {new Date(h.dispensedAt ?? h.createdAt).toLocaleString()}
                      </td>
                      <td className="py-2">{h.patientName || "—"}</td>
                      <td className="py-2 text-xs">{h.prescriptionRef || "—"}</td>
                      <td className="py-2 text-xs">{h.status}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
