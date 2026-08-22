"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import {
  createSalesDocumentAction,
  convertDocumentToSaleAction,
} from "../../actions/create-sales-document";

type ProductOption = {
  id: string;
  name: string;
  sku: string | null;
  retailPrice: number;
  wholesalePrice: number;
  serialized: boolean;
};

type WarehouseOption = { id: string; name: string; branchId: string };

type DraftRow = {
  id: string;
  invoiceNumber: string;
  total: string | number;
  notes: string | null;
  status: string;
};

type Line = {
  productId: string;
  name: string;
  quantity: number;
  unitPrice: number;
  serialized: boolean;
  selectedSerials: string[];
};

interface SalesDocumentFormProps {
  documentType: "quotation" | "order";
  products: ProductOption[];
  warehouses: WarehouseOption[];
  drafts: DraftRow[];
  availableSerials: Record<string, string[]>;
}

export function SalesDocumentForm({
  documentType,
  products,
  warehouses,
  drafts,
  availableSerials: initialSerials,
}: SalesDocumentFormProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const title = documentType === "quotation" ? "Quotation" : "Sales order";

  const [warehouseId, setWarehouseId] = useState(warehouses[0]?.id ?? "");
  const [branchId, setBranchId] = useState(warehouses[0]?.branchId ?? "");
  const [notes, setNotes] = useState("");
  const [productId, setProductId] = useState("");
  const [qty, setQty] = useState("1");
  const [lines, setLines] = useState<Line[]>([]);
  const [priceMode, setPriceMode] = useState<"retail" | "wholesale">("retail");
  const [serialPool, setSerialPool] =
    useState<Record<string, string[]>>(initialSerials);

  const total = useMemo(
    () => lines.reduce((s, l) => s + l.quantity * l.unitPrice, 0),
    [lines],
  );

  function freeSerials(productId: string): string[] {
    const pool = serialPool[productId] ?? [];
    const taken = new Set(
      lines
        .filter((l) => l.productId !== productId)
        .flatMap((l) => l.selectedSerials),
    );
    return pool.filter((s) => !taken.has(s));
  }

  function addLine() {
    const p = products.find((x) => x.id === productId);
    if (!p) {
      toast.error("Select a product.");
      return;
    }
    const unitPrice =
      priceMode === "wholesale" ? p.wholesalePrice : p.retailPrice;
    const q = Math.max(1, Number(qty) || 1);
    setLines((prev) => {
      const existing = prev.find((l) => l.productId === p.id);
      if (existing) {
        return prev.map((l) =>
          l.productId === p.id
            ? {
                ...l,
                quantity: l.quantity + q,
                unitPrice,
                selectedSerials: l.selectedSerials.slice(0, l.quantity + q),
              }
            : l,
        );
      }
      return [
        ...prev,
        {
          productId: p.id,
          name: p.name,
          quantity: q,
          unitPrice,
          serialized: p.serialized,
          selectedSerials: [],
        },
      ];
    });
    setProductId("");
    setQty("1");
  }

  function toggleSerial(productId: string, serial: string) {
    setLines((prev) =>
      prev.map((line) => {
        if (line.productId !== productId) return line;
        const has = line.selectedSerials.includes(serial);
        if (has) {
          return {
            ...line,
            selectedSerials: line.selectedSerials.filter((s) => s !== serial),
          };
        }
        if (line.selectedSerials.length >= line.quantity) {
          toast.message(`Only ${line.quantity} serial(s) needed.`);
          return line;
        }
        return {
          ...line,
          selectedSerials: [...line.selectedSerials, serial],
        };
      }),
    );
  }

  function save() {
    if (lines.length === 0) {
      toast.error("Add at least one line.");
      return;
    }
    for (const line of lines) {
      if (line.serialized && line.selectedSerials.length !== line.quantity) {
        toast.error(
          `${line.name}: select exactly ${line.quantity} serial number(s).`,
        );
        return;
      }
    }
    if (!warehouseId || !branchId) {
      toast.error("Select a warehouse.");
      return;
    }

    startTransition(async () => {
      const result = await createSalesDocumentAction({
        documentType,
        warehouseId,
        branchId,
        notes: notes || null,
        items: lines.map((l) => ({
          productId: l.productId,
          quantity: l.quantity,
          unitPrice: l.unitPrice,
          serialNumbers: l.serialized ? l.selectedSerials : [],
        })),
      });

      if (!result.success) {
        toast.error(result.message);
        return;
      }

      toast.success(result.message);
      // Remove reserved serials from local pool
      setSerialPool((prev) => {
        const next = { ...prev };
        for (const line of lines) {
          if (!line.serialized) continue;
          const used = new Set(line.selectedSerials);
          next[line.productId] = (next[line.productId] ?? []).filter(
            (s) => !used.has(s),
          );
        }
        return next;
      });
      setLines([]);
      setNotes("");
      router.refresh();
    });
  }

  function convert(id: string) {
    startTransition(async () => {
      const result = await convertDocumentToSaleAction({
        saleId: id,
        paymentMethod: "CASH",
      });
      if (!result.success) {
        toast.error(result.message);
        return;
      }
      toast.success(result.message);
      router.push("/sales/invoices");
      router.refresh();
    });
  }

  const filteredDrafts = drafts.filter((d) => {
    const n = (d.notes ?? "").toUpperCase();
    if (documentType === "quotation") {
      return n.includes("[QUOTATION]") || d.invoiceNumber.startsWith("QUO");
    }
    return n.includes("[SALES_ORDER]") || d.invoiceNumber.startsWith("SO");
  });

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-primary">
          Sales
        </p>
        <h1 className="text-2xl font-semibold">New {title.toLowerCase()}</h1>
        <p className="text-sm text-muted-foreground">
          {documentType === "quotation"
            ? "Save a price offer without selling stock. Serialized items need serials now so convert-to-sale is one click."
            : "Record an order without deducting stock yet. Pick serials for serialized products so fulfillment is direct."}
        </p>
      </div>

      <div className="space-y-4 rounded-xl border p-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label>Warehouse</Label>
            <select
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              value={warehouseId}
              onChange={(e) => {
                setWarehouseId(e.target.value);
                const w = warehouses.find((x) => x.id === e.target.value);
                if (w) setBranchId(w.branchId);
              }}
            >
              {warehouses.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.name}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <Label>Price list</Label>
            <select
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              value={priceMode}
              onChange={(e) =>
                setPriceMode(e.target.value as "retail" | "wholesale")
              }
            >
              <option value="retail">Retail</option>
              <option value="wholesale">Wholesale</option>
            </select>
          </div>
        </div>

        <div className="grid gap-2 sm:grid-cols-[1fr_100px_auto]">
          <div className="space-y-1">
            <Label>Product</Label>
            <select
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              value={productId}
              onChange={(e) => setProductId(e.target.value)}
            >
              <option value="">Select…</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                  {p.serialized ? " [serial]" : ""}
                  {p.sku ? ` (${p.sku})` : ""} —{" "}
                  {(priceMode === "wholesale"
                    ? p.wholesalePrice
                    : p.retailPrice
                  ).toFixed(2)}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1">
            <Label>Qty</Label>
            <Input
              type="number"
              min={1}
              value={qty}
              onChange={(e) => setQty(e.target.value)}
            />
          </div>
          <div className="flex items-end">
            <Button type="button" onClick={addLine}>
              Add line
            </Button>
          </div>
        </div>

        <ul className="space-y-3">
          {lines.length === 0 ? (
            <li className="rounded-lg border border-dashed p-4 text-center text-sm text-muted-foreground">
              No lines yet
            </li>
          ) : (
            lines.map((l) => {
              const options = freeSerials(l.productId);
              return (
                <li
                  key={l.productId}
                  className="space-y-2 rounded-lg border px-3 py-2 text-sm"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span>
                      {l.name} × {l.quantity} @ {l.unitPrice.toFixed(2)}
                      {l.serialized ? (
                        <span className="ml-2 text-xs text-primary">
                          serials {l.selectedSerials.length}/{l.quantity}
                        </span>
                      ) : null}
                    </span>
                    <span className="flex items-center gap-3">
                      <span className="font-medium tabular-nums">
                        {(l.quantity * l.unitPrice).toFixed(2)}
                      </span>
                      <button
                        type="button"
                        className="text-xs text-destructive"
                        onClick={() =>
                          setLines((prev) =>
                            prev.filter((x) => x.productId !== l.productId),
                          )
                        }
                      >
                        Remove
                      </button>
                    </span>
                  </div>
                  {l.serialized && (
                    <div className="max-h-28 space-y-1 overflow-y-auto rounded-md border border-primary/20 bg-primary/5 p-2">
                      {options.length === 0 ? (
                        <p className="text-xs text-destructive">
                          No available serials in stock for this product.
                        </p>
                      ) : (
                        options.map((serial) => (
                          <label
                            key={serial}
                            className="flex cursor-pointer items-center gap-2 text-sm"
                          >
                            <input
                              type="checkbox"
                              checked={l.selectedSerials.includes(serial)}
                              onChange={() =>
                                toggleSerial(l.productId, serial)
                              }
                            />
                            <span className="font-mono text-xs">{serial}</span>
                          </label>
                        ))
                      )}
                    </div>
                  )}
                </li>
              );
            })
          )}
        </ul>

        <div className="space-y-1">
          <Label>Notes</Label>
          <Input
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Optional"
          />
        </div>

        <div className="flex items-center justify-between border-t pt-3">
          <span className="text-muted-foreground">Total</span>
          <span className="text-2xl font-bold tabular-nums text-primary">
            {total.toFixed(2)}
          </span>
        </div>

        <Button
          type="button"
          className="w-full"
          size="lg"
          disabled={pending || lines.length === 0}
          onClick={save}
        >
          {pending ? "Saving…" : `Save ${title.toLowerCase()}`}
        </Button>
      </div>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Saved {title.toLowerCase()}s</h2>
        <div className="overflow-x-auto rounded-xl border">
          <table className="w-full text-sm">
            <thead className="bg-secondary/50 text-left">
              <tr>
                <th className="p-3">Number</th>
                <th className="p-3 text-right">Total</th>
                <th className="p-3" />
              </tr>
            </thead>
            <tbody>
              {filteredDrafts.length === 0 ? (
                <tr>
                  <td
                    colSpan={3}
                    className="p-6 text-center text-muted-foreground"
                  >
                    None yet — create one above.
                  </td>
                </tr>
              ) : (
                filteredDrafts.map((d) => (
                  <tr key={d.id} className="border-t">
                    <td className="p-3 font-medium">{d.invoiceNumber}</td>
                    <td className="p-3 text-right tabular-nums">
                      {Number(d.total ?? 0).toFixed(2)}
                    </td>
                    <td className="p-3 text-right">
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        disabled={pending}
                        onClick={() => convert(d.id)}
                      >
                        Convert to sale
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
