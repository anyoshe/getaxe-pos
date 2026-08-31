"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  createPromotionAction,
  togglePromotionAction,
} from "../../actions/promotions";

type Promo = {
  id: string;
  code: string;
  name: string;
  description: string | null;
  discountType: string;
  discountValue: string;
  startsAt: Date | string | null;
  endsAt: Date | string | null;
  scope: string;
  active: boolean;
};

type ProductOpt = { id: string; name: string; sku: string | null };

export function PromotionsClient({
  promotions,
  products,
}: {
  promotions: Promo[];
  products: ProductOpt[];
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [discountType, setDiscountType] = useState<
    "PERCENT_OFF" | "AMOUNT_OFF" | "FIXED_PRICE"
  >("PERCENT_OFF");
  const [discountValue, setDiscountValue] = useState("10");
  const [scope, setScope] = useState<"ALL" | "SELECTED">("ALL");
  const [productIds, setProductIds] = useState<string[]>([]);
  const [startsAt, setStartsAt] = useState("");
  const [endsAt, setEndsAt] = useState("");
  const [productQuery, setProductQuery] = useState("");

  const filteredProducts = useMemo(() => {
    const q = productQuery.trim().toLowerCase();
    if (!q) return products.slice(0, 40);
    return products
      .filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          (p.sku ?? "").toLowerCase().includes(q),
      )
      .slice(0, 40);
  }, [products, productQuery]);

  function toggleProduct(id: string) {
    setProductIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  }

  function onCreate() {
    start(async () => {
      const r = await createPromotionAction({
        code,
        name,
        discountType,
        discountValue: Number(discountValue),
        scope,
        productIds,
        startsAt: startsAt || null,
        endsAt: endsAt || null,
        active: true,
      });
      if (!r.success) {
        toast.error(r.message);
        return;
      }
      toast.success(r.message);
      setCode("");
      setName("");
      setProductIds([]);
      router.refresh();
    });
  }

  function onToggle(id: string, active: boolean) {
    start(async () => {
      const r = await togglePromotionAction(id, active);
      if (!r.success) toast.error("Failed");
      else {
        toast.success(r.message);
        router.refresh();
      }
    });
  }

  function typeLabel(t: string, v: string) {
    const n = Number(v);
    if (t === "PERCENT_OFF") return `${n}% off`;
    if (t === "AMOUNT_OFF") return `${n} off`;
    return `Fixed ${n}`;
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-primary">
          Inventory
        </p>
        <h1 className="text-2xl font-semibold tracking-tight">Promotions</h1>
        <p className="text-sm text-muted-foreground">
          Time-bound discounts applied automatically on POS when this capability
          is enabled. No separate checkout step required.
        </p>
      </div>

      <div className="rounded-xl border bg-card p-4 space-y-3">
        <h2 className="font-medium">New promotion</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <label className="space-y-1 text-sm">
            <span className="text-muted-foreground">Code</span>
            <Input value={code} onChange={(e) => setCode(e.target.value)} placeholder="SUMMER10" />
          </label>
          <label className="space-y-1 text-sm sm:col-span-2">
            <span className="text-muted-foreground">Name</span>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Summer sale 10%" />
          </label>
          <label className="space-y-1 text-sm">
            <span className="text-muted-foreground">Type</span>
            <select
              className="flex h-10 w-full rounded-lg border border-input bg-background px-3 text-sm"
              value={discountType}
              onChange={(e) =>
                setDiscountType(e.target.value as typeof discountType)
              }
            >
              <option value="PERCENT_OFF">Percent off</option>
              <option value="AMOUNT_OFF">Amount off</option>
              <option value="FIXED_PRICE">Fixed price</option>
            </select>
          </label>
          <label className="space-y-1 text-sm">
            <span className="text-muted-foreground">Value</span>
            <Input
              type="number"
              min={0}
              step="any"
              value={discountValue}
              onChange={(e) => setDiscountValue(e.target.value)}
            />
          </label>
          <label className="space-y-1 text-sm">
            <span className="text-muted-foreground">Scope</span>
            <select
              className="flex h-10 w-full rounded-lg border border-input bg-background px-3 text-sm"
              value={scope}
              onChange={(e) => setScope(e.target.value as typeof scope)}
            >
              <option value="ALL">All products</option>
              <option value="SELECTED">Selected products</option>
            </select>
          </label>
          <label className="space-y-1 text-sm">
            <span className="text-muted-foreground">Starts (optional)</span>
            <Input type="datetime-local" value={startsAt} onChange={(e) => setStartsAt(e.target.value)} />
          </label>
          <label className="space-y-1 text-sm">
            <span className="text-muted-foreground">Ends (optional)</span>
            <Input type="datetime-local" value={endsAt} onChange={(e) => setEndsAt(e.target.value)} />
          </label>
        </div>

        {scope === "SELECTED" ? (
          <div className="space-y-2 rounded-lg border border-dashed p-3">
            <Input
              placeholder="Search products…"
              value={productQuery}
              onChange={(e) => setProductQuery(e.target.value)}
            />
            <div className="max-h-40 overflow-y-auto space-y-1">
              {filteredProducts.map((p) => (
                <label
                  key={p.id}
                  className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1 text-sm hover:bg-muted"
                >
                  <input
                    type="checkbox"
                    checked={productIds.includes(p.id)}
                    onChange={() => toggleProduct(p.id)}
                  />
                  <span className="font-medium">{p.name}</span>
                  {p.sku ? (
                    <span className="text-xs text-muted-foreground font-mono">
                      {p.sku}
                    </span>
                  ) : null}
                </label>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">
              {productIds.length} product(s) selected
            </p>
          </div>
        ) : null}

        <Button type="button" disabled={pending} onClick={onCreate}>
          {pending ? "Saving…" : "Create promotion"}
        </Button>
      </div>

      <div className="overflow-x-auto rounded-xl border">
        <table className="w-full min-w-[640px] text-sm">
          <thead className="bg-muted/50 text-left">
            <tr>
              <th className="p-3 font-medium">Code</th>
              <th className="p-3 font-medium">Name</th>
              <th className="p-3 font-medium">Offer</th>
              <th className="p-3 font-medium">Scope</th>
              <th className="p-3 font-medium">Status</th>
              <th className="p-3 font-medium" />
            </tr>
          </thead>
          <tbody>
            {promotions.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-muted-foreground">
                  No promotions yet.
                </td>
              </tr>
            ) : (
              promotions.map((p) => (
                <tr key={p.id} className="border-t">
                  <td className="p-3 font-mono text-xs">{p.code}</td>
                  <td className="p-3 font-medium">{p.name}</td>
                  <td className="p-3">{typeLabel(p.discountType, p.discountValue)}</td>
                  <td className="p-3 text-muted-foreground">{p.scope}</td>
                  <td className="p-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        p.active
                          ? "bg-chart-4/15 text-chart-4"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {p.active ? "Active" : "Off"}
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      disabled={pending}
                      onClick={() => onToggle(p.id, !p.active)}
                    >
                      {p.active ? "Deactivate" : "Activate"}
                    </Button>
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
