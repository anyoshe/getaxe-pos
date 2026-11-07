"use client";

import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  FileText,
  Package,
  Search,
  ShoppingCart,
  User,
  LayoutGrid,
} from "lucide-react";

import {
  globalSearchAction,
  type GlobalSearchHit,
} from "@/features/search/actions/global-search";
import { cn } from "@/lib/utils";

function kindIcon(kind: GlobalSearchHit["kind"]) {
  switch (kind) {
    case "product":
      return Package;
    case "customer":
      return User;
    case "sale":
      return ShoppingCart;
    default:
      return LayoutGrid;
  }
}

export function GlobalSearch() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [hits, setHits] = useState<GlobalSearchHit[]>([]);
  const [active, setActive] = useState(0);
  const [pending, start] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const runSearch = useCallback((q: string) => {
    start(async () => {
      const r = await globalSearchAction(q);
      if (r.success) {
        setHits(r.hits);
        setActive(0);
      }
    });
  }, []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen(true);
      }
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (!open) return;
    setQuery("");
    runSearch("");
    const t = setTimeout(() => inputRef.current?.focus(), 20);
    return () => clearTimeout(t);
  }, [open, runSearch]);

  function onQueryChange(value: string) {
    setQuery(value);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => runSearch(value), 180);
  }

  function go(hit: GlobalSearchHit) {
    setOpen(false);
    router.push(hit.href);
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => Math.min(i + 1, Math.max(0, hits.length - 1)));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && hits[active]) {
      e.preventDefault();
      go(hits[active]);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="relative hidden w-full max-w-md items-center md:flex"
        aria-label="Open search"
      >
        <Search className="pointer-events-none absolute left-3 h-4 w-4 text-muted-foreground" />
        <span className="flex h-10 w-full items-center rounded-xl border border-border bg-background pl-10 pr-3 text-left text-sm text-muted-foreground">
          Search products, customers, invoices…
          <kbd className="ml-auto hidden rounded border border-border bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground sm:inline">
            ⌘K
          </kbd>
        </span>
      </button>

      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border md:hidden"
        aria-label="Search"
      >
        <Search className="h-4 w-4" />
      </button>

      {open ? (
        <div className="fixed inset-0 z-[80]">
          <button
            type="button"
            className="absolute inset-0 bg-black/50 backdrop-blur-[1px]"
            aria-label="Close search"
            onClick={() => setOpen(false)}
          />
          <div className="relative mx-auto mt-[12vh] w-[min(560px,92vw)] overflow-hidden rounded-2xl border border-border bg-card shadow-2xl">
            <div className="flex items-center gap-2 border-b border-border px-3">
              <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => onQueryChange(e.target.value)}
                onKeyDown={onKeyDown}
                placeholder="Search anything…"
                className="h-12 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                autoComplete="off"
              />
              {pending ? (
                <span className="text-[10px] text-muted-foreground">…</span>
              ) : null}
            </div>
            <ul className="max-h-[50vh] overflow-y-auto p-2">
              {hits.length === 0 ? (
                <li className="px-3 py-6 text-center text-sm text-muted-foreground">
                  No matches. Try a SKU, phone, invoice number, or “POS”.
                </li>
              ) : (
                hits.map((hit, i) => {
                  const Icon = kindIcon(hit.kind);
                  return (
                    <li key={`${hit.kind}-${hit.id}`}>
                      <button
                        type="button"
                        onClick={() => go(hit)}
                        onMouseEnter={() => setActive(i)}
                        className={cn(
                          "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition",
                          i === active
                            ? "bg-primary/10 text-foreground"
                            : "hover:bg-muted/80",
                        )}
                      >
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                          <Icon className="h-4 w-4" />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate font-medium">
                            {hit.title}
                          </span>
                          {hit.subtitle ? (
                            <span className="block truncate text-xs text-muted-foreground">
                              {hit.subtitle}
                            </span>
                          ) : null}
                        </span>
                        <span className="shrink-0 text-[10px] uppercase tracking-wide text-muted-foreground">
                          {hit.kind}
                        </span>
                      </button>
                    </li>
                  );
                })
              )}
            </ul>
            <div className="flex items-center gap-3 border-t border-border px-3 py-2 text-[10px] text-muted-foreground">
              <span>↑↓ navigate</span>
              <span>↵ open</span>
              <span>esc close</span>
              <FileText className="ml-auto h-3 w-3 opacity-50" />
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
