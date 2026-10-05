"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { addIndustryStarterProductsAction } from "../../actions/industry-starters";
import {
  INDUSTRY_STARTER_KIT_META,
  type IndustryStarterKitId,
} from "../../constants/industry-starters/default-industry-starters";

export type IndustryStarterRow = {
  kit: IndustryStarterKitId;
  code: string;
  name: string;
  sku: string;
  categoryName: string;
  serialized: boolean;
  suggestedCost: number | null;
  suggestedSell: number | null;
  description: string | null;
  alreadyInCatalogue: boolean;
};

const KITS: IndustryStarterKitId[] = [
  "hardware",
  "agrovet",
  "motorbike",
  "auto",
];

export function StarterKitsClient({
  products,
}: {
  products: IndustryStarterRow[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [kit, setKit] = useState<IndustryStarterKitId | "all">("hardware");
  const [q, setQ] = useState("");
  const [selected, setSelected] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {};
    for (const p of products) {
      if (!p.alreadyInCatalogue && p.kit === "hardware") init[p.code] = true;
    }
    return init;
  });

  const filtered = useMemo(() => {
    const qq = q.trim().toLowerCase();
    return products.filter((p) => {
      if (kit !== "all" && p.kit !== kit) return false;
      if (!qq) return true;
      return (
        p.name.toLowerCase().includes(qq) ||
        p.sku.toLowerCase().includes(qq) ||
        p.categoryName.toLowerCase().includes(qq)
      );
    });
  }, [products, kit, q]);

  const selectedCodes = useMemo(
    () => Object.entries(selected).filter(([, v]) => v).map(([k]) => k),
    [selected],
  );

  const missingInView = filtered.filter((p) => !p.alreadyInCatalogue).length;

  function selectMissingInView() {
    setSelected((prev) => {
      const next = { ...prev };
      for (const p of filtered) {
        if (!p.alreadyInCatalogue) next[p.code] = true;
      }
      return next;
    });
  }

  function clearSelection() {
    setSelected({});
  }

  function onKitChange(next: IndustryStarterKitId | "all") {
    setKit(next);
    setSelected(() => {
      const init: Record<string, boolean> = {};
      for (const p of products) {
        if (p.alreadyInCatalogue) continue;
        if (next === "all" || p.kit === next) init[p.code] = true;
      }
      return init;
    });
  }

  function addSelected() {
    if (selectedCodes.length === 0) {
      toast.error("Select at least one product.");
      return;
    }
    startTransition(async () => {
      const r = await addIndustryStarterProductsAction(selectedCodes);
      if (!r.success) {
        toast.error(r.message);
        return;
      }
      toast.success(r.message);
      router.refresh();
    });
  }

  return (
    <div className="space-y-4">
      <div className="rounded-xl border bg-card p-4 shadow-sm">
        <h2 className="text-lg font-semibold tracking-tight">
          Industry starter kits
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Product masters only — no stock and no shared serials. Select lines
          for your shop type, add them, then receive opening stock or GRN for
          quantities you actually hold. Complete units (bikes / 3-wheelers) are
          marked serialized.
        </p>

        <div className="mt-4 flex flex-wrap gap-2">
          {KITS.map((id) => (
            <Button
              key={id}
              type="button"
              size="sm"
              variant={kit === id ? "default" : "outline"}
              onClick={() => onKitChange(id)}
            >
              {INDUSTRY_STARTER_KIT_META[id].label}
            </Button>
          ))}
          <Button
            type="button"
            size="sm"
            variant={kit === "all" ? "default" : "outline"}
            onClick={() => onKitChange("all")}
          >
            All kits
          </Button>
        </div>

        {kit !== "all" && (
          <p className="mt-2 text-xs text-muted-foreground">
            {INDUSTRY_STARTER_KIT_META[kit].description}
          </p>
        )}

        <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center">
          <Input
            placeholder="Search name, SKU, category…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="sm:max-w-sm"
          />
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={selectMissingInView}
            >
              Select missing ({missingInView})
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={clearSelection}
            >
              Clear
            </Button>
            <Button
              type="button"
              size="sm"
              disabled={pending || selectedCodes.length === 0}
              onClick={addSelected}
            >
              {pending
                ? "Adding…"
                : `Add selected (${selectedCodes.length})`}
            </Button>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="border-b bg-muted/50 text-xs uppercase text-muted-foreground">
            <tr>
              <th className="p-2 w-10" />
              <th className="p-2">Product</th>
              <th className="p-2">SKU</th>
              <th className="p-2">Category</th>
              <th className="p-2">Kit</th>
              <th className="p-2 text-right">Cost</th>
              <th className="p-2 text-right">Sell</th>
              <th className="p-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => (
              <tr
                key={p.code}
                className="border-b border-border/60 hover:bg-muted/30"
              >
                <td className="p-2">
                  <input
                    type="checkbox"
                    disabled={p.alreadyInCatalogue}
                    checked={Boolean(selected[p.code])}
                    onChange={(e) =>
                      setSelected((s) => ({
                        ...s,
                        [p.code]: e.target.checked,
                      }))
                    }
                  />
                </td>
                <td className="p-2 font-medium">
                  {p.name}
                  {p.serialized ? (
                    <span className="ml-1 text-[10px] font-normal text-primary">
                      serial
                    </span>
                  ) : null}
                </td>
                <td className="p-2 font-mono text-xs">{p.sku}</td>
                <td className="p-2 text-muted-foreground">{p.categoryName}</td>
                <td className="p-2 text-xs capitalize">{p.kit}</td>
                <td className="p-2 text-right tabular-nums">
                  {p.suggestedCost != null
                    ? p.suggestedCost.toLocaleString()
                    : "—"}
                </td>
                <td className="p-2 text-right tabular-nums">
                  {p.suggestedSell != null
                    ? p.suggestedSell.toLocaleString()
                    : "—"}
                </td>
                <td className="p-2 text-xs">
                  {p.alreadyInCatalogue ? (
                    <span className="text-emerald-600 dark:text-emerald-400">
                      In catalogue
                    </span>
                  ) : (
                    <span className="text-muted-foreground">Available</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 ? (
          <p className="p-6 text-center text-sm text-muted-foreground">
            No lines match this filter.
          </p>
        ) : null}
      </div>
    </div>
  );
}
