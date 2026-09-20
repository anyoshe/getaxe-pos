"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  ArrowLeft,
  ShoppingCart,
  PackagePlus,
  Trash2,
  Percent,
  Banknote,
  FileText,
  AlertTriangle,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  disposeExpiringBatchAction,
  defaultWarehouseIdAction,
} from "../actions/attention-actions";
import type {
  AttentionBundle,
  RestockLine,
  ExpiryLine,
} from "../services/attention.service";

function money(n: number) {
  return n.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
}

export function AttentionCenter({
  kind,
  initial,
}: {
  kind: string;
  initial: AttentionBundle;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [bundle, setBundle] = useState(initial);
  const [restockQty, setRestockQty] = useState<Record<string, number>>(() => {
    const m: Record<string, number> = {};
    for (const r of initial.restock) m[r.productId] = r.suggestedOrderQty;
    return m;
  });
  const [selectedRestock, setSelectedRestock] = useState<Record<string, boolean>>(
    () => {
      const m: Record<string, boolean> = {};
      for (const r of initial.restock) m[r.productId] = true;
      return m;
    },
  );

  const tabs = [
    { id: "restock", label: "Restock" },
    { id: "expiry", label: "Expiry" },
    { id: "receivable", label: "Collect debts" },
    { id: "payable", label: "Pay suppliers" },
    { id: "slow", label: "Slow stock" },
    { id: "expense", label: "Expenses" },
  ] as const;

  function openPrefillPo(lines: RestockLine[]) {
    const selected = lines.filter((l) => selectedRestock[l.productId]);
    if (selected.length === 0) {
      toast.error("Select at least one product to order.");
      return;
    }
    const payload = selected.map((l) => ({
      productId: l.productId,
      quantity: Math.max(1, Number(restockQty[l.productId] || l.suggestedOrderQty)),
      unitCost: l.costPrice,
      supplierId: l.supplierId,
    }));
    const encoded = encodeURIComponent(JSON.stringify(payload));
    router.push(`/purchases/orders?prefill=${encoded}&open=1`);
  }

  function dispose(line: ExpiryLine) {
    start(async () => {
      let warehouseId = line.warehouseId;
      if (!warehouseId) {
        warehouseId = await defaultWarehouseIdAction();
      }
      if (!warehouseId) {
        toast.error("No warehouse found. Set up a warehouse first.");
        return;
      }
      const res = await disposeExpiringBatchAction({
        batchId: line.batchId,
        warehouseId,
        quantity: line.quantityRemaining,
      });
      if (!res.success) {
        toast.error(res.message);
        return;
      }
      toast.success(res.message);
      setBundle((prev) => ({
        ...prev,
        expiry: prev.expiry.filter((e) => e.batchId !== line.batchId),
      }));
      router.refresh();
    });
  }

  const restockSelectedCount = useMemo(
    () => Object.values(selectedRestock).filter(Boolean).length,
    [selectedRestock],
  );

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link
            href="/dashboard"
            className="mb-2 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary"
          >
            <ArrowLeft className="h-4 w-4" /> Dashboard
          </Link>
          <h1 className="text-2xl font-bold tracking-tight">Take action</h1>
          <p className="text-sm text-muted-foreground">{bundle.title}</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {tabs.map((t) => (
          <Link
            key={t.id}
            href={`/dashboard/attention?kind=${t.id}`}
            className={`rounded-full border px-3 py-1.5 text-sm font-medium transition ${
              kind === t.id
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-card text-muted-foreground hover:border-primary/40"
            }`}
          >
            {t.label}
          </Link>
        ))}
      </div>

      {kind === "restock" && (
        <section className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm text-muted-foreground">
              Adjust quantities, then create a purchase order with these lines
              prefilled.
            </p>
            <Button
              disabled={pending || restockSelectedCount === 0}
              onClick={() => openPrefillPo(bundle.restock)}
            >
              <PackagePlus className="mr-2 h-4 w-4" />
              Create PO ({restockSelectedCount})
            </Button>
          </div>
          {bundle.restock.length === 0 ? (
            <Empty text="No products at or below reorder level." />
          ) : (
            <div className="overflow-x-auto rounded-xl border">
              <table className="w-full min-w-[640px] text-left text-sm">
                <thead className="bg-muted/50 text-xs uppercase text-muted-foreground">
                  <tr>
                    <th className="p-3">Order</th>
                    <th className="p-3">Product</th>
                    <th className="p-3">On hand</th>
                    <th className="p-3">Reorder</th>
                    <th className="p-3">Order qty</th>
                    <th className="p-3">Est. cost</th>
                  </tr>
                </thead>
                <tbody>
                  {bundle.restock.map((r) => (
                    <tr key={r.productId} className="border-t">
                      <td className="p-3">
                        <input
                          type="checkbox"
                          checked={!!selectedRestock[r.productId]}
                          onChange={(e) =>
                            setSelectedRestock((s) => ({
                              ...s,
                              [r.productId]: e.target.checked,
                            }))
                          }
                        />
                      </td>
                      <td className="p-3">
                        <div className="font-medium">{r.name}</div>
                        {r.sku ? (
                          <div className="font-mono text-xs text-muted-foreground">
                            {r.sku}
                          </div>
                        ) : null}
                      </td>
                      <td className="p-3 tabular-nums">{r.quantity}</td>
                      <td className="p-3 tabular-nums">{r.reorderLevel}</td>
                      <td className="p-3">
                        <Input
                          type="number"
                          min={1}
                          className="h-9 w-24"
                          value={restockQty[r.productId] ?? r.suggestedOrderQty}
                          onChange={(e) =>
                            setRestockQty((q) => ({
                              ...q,
                              [r.productId]: Number(e.target.value) || 1,
                            }))
                          }
                        />
                      </td>
                      <td className="p-3 tabular-nums">
                        {money(
                          (restockQty[r.productId] ?? r.suggestedOrderQty) *
                            r.costPrice,
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}

      {kind === "expiry" && (
        <section className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Sell near-expiry first (FEFO on POS), discount via promotions, or
            write off remaining stock (reduces quantity and inventory value).
          </p>
          {bundle.expiry.length === 0 ? (
            <Empty text="No batches expiring in the next 90 days." />
          ) : (
            <div className="space-y-3">
              {bundle.expiry.map((e) => (
                <div
                  key={e.batchId}
                  className="flex flex-col gap-3 rounded-xl border border-amber-500/25 bg-amber-500/5 p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="font-medium">{e.productName}</p>
                    <p className="text-sm text-muted-foreground">
                      Batch {e.batchNumber} · Expiry{" "}
                      <span className="font-semibold text-amber-700 dark:text-amber-400">
                        {e.expiryDate}
                      </span>{" "}
                      · Qty {e.quantityRemaining}
                      {e.warehouseName ? ` · ${e.warehouseName}` : ""}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Book value ~ {money(e.quantityRemaining * e.costPrice)}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button variant="outline" size="sm" asChild>
                      <Link href="/sales/pos">
                        <ShoppingCart className="mr-1 h-4 w-4" />
                        Sell first (POS)
                      </Link>
                    </Button>
                    <Button variant="outline" size="sm" asChild>
                      <Link href="/inventory/promotions">
                        <Percent className="mr-1 h-4 w-4" />
                        Discount / promo
                      </Link>
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      disabled={pending || !e.quantityRemaining}
                      onClick={() => dispose(e)}
                    >
                      <Trash2 className="mr-1 h-4 w-4" />
                      Write off stock
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {kind === "receivable" && (
        <section className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm text-muted-foreground">
              Open credit invoices — collect payment and print receipt from
              receivables.
            </p>
            <Button asChild>
              <Link href="/sales/receivables">
                <Banknote className="mr-2 h-4 w-4" />
                Open collections
              </Link>
            </Button>
          </div>
          {bundle.receivables.length === 0 ? (
            <Empty text="No open customer balances." />
          ) : (
            <div className="overflow-x-auto rounded-xl border">
              <table className="w-full min-w-[640px] text-left text-sm">
                <thead className="bg-muted/50 text-xs uppercase text-muted-foreground">
                  <tr>
                    <th className="p-3">Invoice</th>
                    <th className="p-3">Customer</th>
                    <th className="p-3">Sold</th>
                    <th className="p-3">Days open</th>
                    <th className="p-3">Balance</th>
                    <th className="p-3" />
                  </tr>
                </thead>
                <tbody>
                  {bundle.receivables.map((r) => (
                    <tr key={r.saleId} className="border-t">
                      <td className="p-3 font-mono text-xs">
                        {r.invoiceNumber}
                      </td>
                      <td className="p-3">
                        <div className="font-medium">{r.customerName}</div>
                        {r.phone ? (
                          <div className="text-xs text-muted-foreground">
                            {r.phone}
                          </div>
                        ) : null}
                      </td>
                      <td className="p-3 text-xs">
                        {new Date(r.soldAt).toLocaleDateString()}
                      </td>
                      <td className="p-3 tabular-nums">
                        <span
                          className={
                            r.daysOpen > 30
                              ? "font-semibold text-rose-600"
                              : ""
                          }
                        >
                          {r.daysOpen}
                        </span>
                      </td>
                      <td className="p-3 tabular-nums font-medium">
                        {money(r.balanceDue)}
                      </td>
                      <td className="p-3">
                        <Button size="sm" variant="outline" asChild>
                          <Link href="/sales/receivables">Collect</Link>
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}

      {kind === "payable" && (
        <section className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm text-muted-foreground">
              Unpaid supplier invoices with due dates — pay from Cash & bank.
            </p>
            <Button asChild>
              <Link href="/purchases/supplier-invoices">
                <FileText className="mr-2 h-4 w-4" />
                Supplier invoices
              </Link>
            </Button>
          </div>
          {bundle.payables.length === 0 ? (
            <Empty text="No open supplier balances." />
          ) : (
            <div className="overflow-x-auto rounded-xl border">
              <table className="w-full min-w-[640px] text-left text-sm">
                <thead className="bg-muted/50 text-xs uppercase text-muted-foreground">
                  <tr>
                    <th className="p-3">Invoice</th>
                    <th className="p-3">Supplier</th>
                    <th className="p-3">Due</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Balance</th>
                    <th className="p-3" />
                  </tr>
                </thead>
                <tbody>
                  {bundle.payables.map((p) => (
                    <tr key={p.invoiceId} className="border-t">
                      <td className="p-3 font-mono text-xs">
                        {p.invoiceNumber}
                      </td>
                      <td className="p-3 font-medium">{p.supplierName}</td>
                      <td className="p-3 tabular-nums">
                        {p.dueDate ?? "—"}
                      </td>
                      <td className="p-3">
                        {p.overdue ? (
                          <span className="rounded-full bg-rose-500/15 px-2 py-0.5 text-xs font-medium text-rose-700 dark:text-rose-300">
                            Overdue
                          </span>
                        ) : p.daysUntilDue != null ? (
                          <span className="text-xs text-muted-foreground">
                            in {p.daysUntilDue}d
                          </span>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td className="p-3 tabular-nums font-medium">
                        {money(p.balanceDue)}
                      </td>
                      <td className="p-3">
                        <Button size="sm" variant="outline" asChild>
                          <Link href="/purchases/supplier-invoices">Pay</Link>
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}

      {kind === "slow" && (
        <section className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Capital tied in items with no sales for 30 days — avoid restocking
            these until they move.
          </p>
          {bundle.slow.length === 0 ? (
            <Empty text="No slow-moving stock detected." />
          ) : (
            <div className="overflow-x-auto rounded-xl border">
              <table className="w-full min-w-[480px] text-left text-sm">
                <thead className="bg-muted/50 text-xs uppercase text-muted-foreground">
                  <tr>
                    <th className="p-3">Product</th>
                    <th className="p-3">Qty</th>
                    <th className="p-3">Est. value</th>
                    <th className="p-3" />
                  </tr>
                </thead>
                <tbody>
                  {bundle.slow.map((s) => (
                    <tr key={s.productId} className="border-t">
                      <td className="p-3">
                        <div className="font-medium">{s.name}</div>
                        {s.sku ? (
                          <div className="font-mono text-xs text-muted-foreground">
                            {s.sku}
                          </div>
                        ) : null}
                      </td>
                      <td className="p-3 tabular-nums">{s.quantity}</td>
                      <td className="p-3 tabular-nums">{money(s.stockValue)}</td>
                      <td className="p-3">
                        <Button size="sm" variant="outline" asChild>
                          <Link href="/sales/pos">Push on POS</Link>
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}

      {kind === "expense" && (
        <section className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm text-muted-foreground">
              Expenses in the last 14 days and next 30 days (by expense date).
              Record new ones under Finance.
            </p>
            <Button asChild>
              <Link href="/finance/expenses">
                <AlertTriangle className="mr-2 h-4 w-4" />
                Expenses
              </Link>
            </Button>
          </div>
          {bundle.expenses.length === 0 ? (
            <Empty text="No expenses in this window." />
          ) : (
            <div className="overflow-x-auto rounded-xl border">
              <table className="w-full min-w-[560px] text-left text-sm">
                <thead className="bg-muted/50 text-xs uppercase text-muted-foreground">
                  <tr>
                    <th className="p-3">Date</th>
                    <th className="p-3">Description</th>
                    <th className="p-3">Category</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {bundle.expenses.map((e) => (
                    <tr key={e.id} className="border-t">
                      <td className="p-3 tabular-nums">{e.expenseDate}</td>
                      <td className="p-3">
                        <div className="font-medium">{e.description}</div>
                        {e.paidTo ? (
                          <div className="text-xs text-muted-foreground">
                            {e.paidTo}
                          </div>
                        ) : null}
                      </td>
                      <td className="p-3">{e.category}</td>
                      <td className="p-3 text-xs">{e.status}</td>
                      <td className="p-3 tabular-nums font-medium">
                        {money(e.amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}
    </div>
  );
}

function Empty({ text }: { text: string }) {
  return (
    <div className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">
      {text}
    </div>
  );
}
