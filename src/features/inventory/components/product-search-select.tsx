"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { Loader2, Search, X } from "lucide-react";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  searchInventoryProductsAction,
  type InventoryProductHit,
} from "../actions/search-inventory-products";

type Props = {
  value: InventoryProductHit | null;
  onChange: (product: InventoryProductHit | null) => void;
  stockableOnly?: boolean;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
};

/**
 * Search-first product picker — no full catalogue download.
 * Type at least 1 character (name, SKU, or barcode).
 */
export function ProductSearchSelect({
  value,
  onChange,
  stockableOnly = true,
  placeholder = "Search name, SKU, or barcode…",
  disabled,
  className,
}: Props) {
  const listId = useId();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [hits, setHits] = useState<InventoryProductHit[]>([]);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);

  const runSearch = useCallback(
    async (q: string) => {
      const trimmed = q.trim();
      if (trimmed.length < 1) {
        setHits([]);
        setLoading(false);
        return;
      }
      setLoading(true);
      const res = await searchInventoryProductsAction({
        query: trimmed,
        limit: 20,
        stockableOnly,
      });
      setLoading(false);
      if (res.success) setHits(res.products);
      else setHits([]);
    },
    [stockableOnly],
  );

  useEffect(() => {
    if (timer.current) clearTimeout(timer.current);
    if (!open) return;
    timer.current = setTimeout(() => {
      void runSearch(query);
    }, 220);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [query, open, runSearch]);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  function select(p: InventoryProductHit) {
    onChange(p);
    setQuery("");
    setHits([]);
    setOpen(false);
  }

  function clear() {
    onChange(null);
    setQuery("");
    setHits([]);
  }

  return (
    <div ref={rootRef} className={cn("relative", className)}>
      {value ? (
        <div className="flex h-10 items-center gap-2 rounded-md border border-input bg-background px-3 text-sm">
          <span className="min-w-0 flex-1 truncate">
            <span className="font-medium">{value.name}</span>
            {value.sku ? (
              <span className="text-muted-foreground"> · {value.sku}</span>
            ) : null}
          </span>
          <button
            type="button"
            className="shrink-0 rounded p-0.5 text-muted-foreground hover:bg-muted hover:text-foreground"
            onClick={clear}
            disabled={disabled}
            aria-label="Clear product"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            disabled={disabled}
            placeholder={placeholder}
            className="pl-9 pr-9"
            role="combobox"
            aria-expanded={open}
            aria-controls={listId}
            autoComplete="off"
            onFocus={() => setOpen(true)}
            onChange={(e) => {
              setQuery(e.target.value);
              setOpen(true);
            }}
          />
          {loading ? (
            <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />
          ) : null}
        </div>
      )}

      {open && !value && (query.trim().length > 0 || hits.length > 0) ? (
        <ul
          id={listId}
          role="listbox"
          className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md border border-border bg-popover py-1 text-sm shadow-md"
        >
          {loading && hits.length === 0 ? (
            <li className="px-3 py-2 text-muted-foreground">Searching…</li>
          ) : null}
          {!loading && query.trim().length > 0 && hits.length === 0 ? (
            <li className="px-3 py-2 text-muted-foreground">No products found</li>
          ) : null}
          {hits.map((p) => (
            <li key={p.id} role="option">
              <button
                type="button"
                className="flex w-full flex-col items-start px-3 py-2 text-left hover:bg-muted"
                onClick={() => select(p)}
              >
                <span className="font-medium leading-tight">{p.name}</span>
                <span className="text-xs text-muted-foreground">
                  {[p.sku, p.barcode].filter(Boolean).join(" · ") || "No SKU"}
                </span>
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
