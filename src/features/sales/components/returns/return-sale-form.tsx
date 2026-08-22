"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { createSaleReturnAction } from "../../actions/create-sale-return";

type SaleOption = {
  id: string;
  invoiceNumber: string;
  total: string | number;
  warehouseId: string;
};

type SaleItem = {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: string | number;
  productBatchId: string | null;
  serialized: boolean;
  soldSerials: string[];
};

interface ReturnSaleFormProps {
  sales: SaleOption[];
  initialSaleId?: string;
  initialItems?: SaleItem[];
}

export function ReturnSaleForm({
  sales,
  initialSaleId,
  initialItems = [],
}: ReturnSaleFormProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [saleId, setSaleId] = useState(initialSaleId ?? sales[0]?.id ?? "");
  const [reason, setReason] = useState("CUSTOMER_CHANGED_MIND");
  const [qtys, setQtys] = useState<Record<string, number>>(() => {
    const m: Record<string, number> = {};
    for (const i of initialItems) m[i.id] = 0;
    return m;
  });
  const [serials, setSerials] = useState<Record<string, string[]>>({});

  const sale = sales.find((s) => s.id === saleId);
  const items = useMemo(() => initialItems, [initialItems]);

  function toggleSerial(itemId: string, serial: string, maxQty: number) {
    setSerials((prev) => {
      const cur = prev[itemId] ?? [];
      if (cur.includes(serial)) {
        return { ...prev, [itemId]: cur.filter((s) => s !== serial) };
      }
      if (cur.length >= maxQty) {
        toast.message(`Only ${maxQty} serial(s) for this return qty.`);
        return prev;
      }
      return { ...prev, [itemId]: [...cur, serial] };
    });
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!sale) return;

    const selected = items
      .filter((i) => (qtys[i.id] ?? 0) > 0)
      .map((i) => ({
        saleItemId: i.id,
        productId: i.productId,
        quantity: qtys[i.id],
        unitPrice: Number(i.unitPrice),
        productBatchId: i.productBatchId,
        warehouseId: sale.warehouseId,
        serialNumbers: i.serialized ? (serials[i.id] ?? []) : [],
      }));

    if (selected.length === 0) {
      toast.error("Select at least one quantity to return.");
      return;
    }

    for (const line of selected) {
      const item = items.find((i) => i.id === line.saleItemId);
      if (item?.serialized && line.serialNumbers.length !== line.quantity) {
        toast.error(
          `${item.productName}: select ${line.quantity} serial(s) to return.`,
        );
        return;
      }
    }

    startTransition(async () => {
      const result = await createSaleReturnAction({
        saleId,
        reason,
        items: selected,
      });
      if (!result.success) {
        toast.error(result.message);
        return;
      }
      toast.success(result.message);
      router.push("/sales/returns");
      router.refresh();
    });
  }

  return (
    <form onSubmit={onSubmit} className="mx-auto max-w-2xl space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-primary">
          Sales
        </p>
        <h1 className="text-2xl font-semibold">Sale return</h1>
        <p className="text-sm text-muted-foreground">
          Restocks warehouse balances and returns serials to available stock.
        </p>
      </div>

      <div className="space-y-4 rounded-xl border p-4">
        <div className="space-y-2">
          <Label>Invoice</Label>
          <select
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
            value={saleId}
            onChange={(e) => {
              setSaleId(e.target.value);
              router.push(`/sales/returns?saleId=${e.target.value}`);
            }}
          >
            {sales.map((s) => (
              <option key={s.id} value={s.id}>
                {s.invoiceNumber} — {Number(s.total).toFixed(2)}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <Label>Reason</Label>
          <select
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          >
            <option value="CUSTOMER_CHANGED_MIND">Customer changed mind</option>
            <option value="DAMAGED">Damaged</option>
            <option value="DEFECTIVE">Defective</option>
            <option value="EXPIRED">Expired</option>
            <option value="WRONG_ITEM">Wrong item</option>
            <option value="PRICE_ADJUSTMENT">Price adjustment</option>
            <option value="OTHER">Other</option>
          </select>
        </div>

        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Select an invoice to load line items.
          </p>
        ) : (
          <ul className="space-y-3">
            {items.map((i) => {
              const q = qtys[i.id] ?? 0;
              return (
                <li
                  key={i.id}
                  className="space-y-2 rounded-lg border p-3"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="font-medium text-sm">{i.productName}</p>
                      <p className="text-xs text-muted-foreground">
                        Sold qty {i.quantity} @ {Number(i.unitPrice).toFixed(2)}
                        {i.serialized ? " · serialized" : ""}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Label className="text-xs">Return</Label>
                      <Input
                        className="h-9 w-20"
                        type="number"
                        min={0}
                        max={i.quantity}
                        value={q}
                        onChange={(e) => {
                          const n = Math.min(
                            i.quantity,
                            Math.max(0, Number(e.target.value) || 0),
                          );
                          setQtys((prev) => ({ ...prev, [i.id]: n }));
                          setSerials((prev) => ({
                            ...prev,
                            [i.id]: (prev[i.id] ?? []).slice(0, n),
                          }));
                        }}
                      />
                    </div>
                  </div>
                  {i.serialized && q > 0 && (
                    <div className="max-h-28 space-y-1 overflow-y-auto rounded-md border border-primary/20 bg-primary/5 p-2">
                      <p className="text-xs text-muted-foreground">
                        Select serials to return ({(serials[i.id] ?? []).length}/
                        {q})
                      </p>
                      {i.soldSerials.length === 0 ? (
                        <p className="text-xs text-destructive">
                          No sold serials linked to this invoice. Enter them
                          under Customers/stock if needed.
                        </p>
                      ) : (
                        i.soldSerials.map((s) => (
                          <label
                            key={s}
                            className="flex cursor-pointer items-center gap-2 text-sm"
                          >
                            <input
                              type="checkbox"
                              checked={(serials[i.id] ?? []).includes(s)}
                              onChange={() => toggleSerial(i.id, s, q)}
                            />
                            <span className="font-mono text-xs">{s}</span>
                          </label>
                        ))
                      )}
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
        <Button type="submit" disabled={pending || items.length === 0}>
          {pending ? "Saving…" : "Process return"}
        </Button>
      </div>
    </form>
  );
}
