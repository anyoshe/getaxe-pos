"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import {
  ArrowRight,
  CheckCircle2,
  Circle,
  Clock,
  FileSpreadsheet,
  PackagePlus,
  Rocket,
  Sparkles,
  Upload,
} from "lucide-react";
import { toast } from "sonner";

import type { SetupCheck } from "../services/setup-readiness.service";
import {
  buildGoLiveDay,
  resolveGoLiveVertical,
  verticalLabel,
  type GoLiveTask,
  type GoLiveVertical,
} from "../lib/go-live-day";
import { VERTICAL_PACKS } from "../lib/vertical-pack";
import { applyVerticalPackAction } from "../actions/apply-vertical-pack";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ProductImportDialog } from "@/features/inventory/components/products/product-import-dialog";
import { OpeningStockImportDialog } from "@/features/inventory/components/stock/opening-stock-import-dialog";

type Props = {
  businessName: string | null;
  businessType: string | null;
  score: number;
  checks: SetupCheck[];
  requiredDone: number;
  requiredTotal: number;
};

function taskDone(task: GoLiveTask, checks: SetupCheck[]): boolean | null {
  if (!task.readinessId) return null;
  const c = checks.find((x) => x.id === task.readinessId);
  if (!c) return null;
  return c.done;
}

export function GoLiveDayClient({
  businessName,
  businessType,
  score,
  checks,
  requiredDone,
  requiredTotal,
}: Props) {
  const router = useRouter();
  const resolved = resolveGoLiveVertical(businessType);
  const [selectedVertical, setSelectedVertical] =
    useState<GoLiveVertical>(resolved);
  const [loadStarters, setLoadStarters] = useState(true);
  const [pending, startTransition] = useTransition();
  const [productImportOpen, setProductImportOpen] = useState(false);
  const [openingImportOpen, setOpeningImportOpen] = useState(false);

  const vertical = selectedVertical;
  const blocks = buildGoLiveDay(vertical);

  const allTasks = blocks.flatMap((b) => b.tasks);
  const tracked = allTasks.filter((t) => t.readinessId);
  const trackedDone = tracked.filter((t) => taskDone(t, checks) === true).length;
  const totalMinutes = allTasks.reduce((s, t) => s + t.minutes, 0);

  const productDone = checks.find((c) => c.id === "product")?.done === true;
  const stockDone = checks.find((c) => c.id === "stock")?.done === true;

  function applyPack() {
    startTransition(async () => {
      const res = await applyVerticalPackAction({
        vertical: selectedVertical,
        loadStarters,
      });
      if (!res.success) {
        toast.error(res.message);
        return;
      }
      toast.success(res.message);
      router.refresh();
    });
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Hero */}
      <header className="relative overflow-hidden rounded-2xl border border-primary/25 bg-gradient-to-br from-primary/15 via-card to-card p-5 sm:p-7">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-primary">
              <Rocket className="h-3.5 w-3.5" />
              Go live in 1 day
            </p>
            <h1 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
              {businessName || "Your business"} · {verticalLabel(vertical)}
            </h1>
            <p className="mt-2 max-w-xl text-sm text-muted-foreground">
              One screen for day one: pick your trade → load catalogue → opening
              stock → first sale. Green checks come from live readiness.
            </p>
          </div>
          <div className="rounded-xl border border-border bg-background/80 px-4 py-3 text-center shadow-sm">
            <p className="text-3xl font-bold tabular-nums text-primary">
              {score}%
            </p>
            <p className="text-[11px] text-muted-foreground">
              Readiness · {requiredDone}/{requiredTotal} required
            </p>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-3 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1 rounded-full border border-border bg-background/60 px-2.5 py-1">
            <Clock className="h-3.5 w-3.5" />~{totalMinutes} min guided
          </span>
          <span className="inline-flex items-center gap-1 rounded-full border border-border bg-background/60 px-2.5 py-1">
            <Sparkles className="h-3.5 w-3.5" />
            {trackedDone}/{tracked.length || 0} tracked steps done
          </span>
          <Link
            href="/settings/setup-guide"
            className="inline-flex items-center gap-1 rounded-full border border-border bg-background/60 px-2.5 py-1 hover:border-primary/40"
          >
            Full step-by-step guide
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      </header>

      {/* Vertical bootstrap */}
      <section className="rounded-2xl border border-border bg-card p-4 shadow-sm sm:p-5">
        <h2 className="text-base font-semibold tracking-tight">
          1. What do you sell?
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Sets business type, turns on the right capabilities, and optionally
          loads a starter product list so you are not typing every line.
        </p>

        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          {VERTICAL_PACKS.map((pack) => {
            const active = selectedVertical === pack.vertical;
            return (
              <button
                key={pack.vertical}
                type="button"
                onClick={() => setSelectedVertical(pack.vertical)}
                className={cn(
                  "rounded-xl border px-3 py-3 text-left transition",
                  active
                    ? "border-primary bg-primary/10 shadow-sm"
                    : "border-border bg-background hover:border-primary/40",
                )}
              >
                <p className="text-sm font-semibold">{pack.label}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {pack.blurb}
                </p>
              </button>
            );
          })}
        </div>

        <label className="mt-4 flex cursor-pointer items-start gap-2 text-sm">
          <input
            type="checkbox"
            className="mt-1 h-4 w-4 rounded border-border"
            checked={loadStarters}
            onChange={(e) => setLoadStarters(e.target.checked)}
          />
          <span>
            <span className="font-medium">Also load starter products</span>
            <span className="block text-xs text-muted-foreground">
              Masters only (no stock). Skip if you will import your own
              spreadsheet next.
            </span>
          </span>
        </label>

        <div className="mt-4 flex flex-wrap gap-2">
          <Button
            type="button"
            onClick={applyPack}
            disabled={pending}
            className="gap-2"
          >
            {pending ? "Applying…" : "Apply vertical pack"}
            <Rocket className="h-4 w-4" />
          </Button>
          <Link
            href="/settings/capabilities"
            className="inline-flex h-10 items-center rounded-xl border border-border bg-background px-4 text-sm font-medium"
          >
            Fine-tune capabilities
          </Link>
        </div>
      </section>

      {/* Catalogue & stock shortcuts */}
      <section className="rounded-2xl border border-border bg-card p-4 shadow-sm sm:p-5">
        <h2 className="text-base font-semibold tracking-tight">
          2. Catalogue & opening stock
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Prefer your own price list? Import it. Continuing business? Bring
          opening quantities. Starter kit is the zero-typing path.
        </p>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => setProductImportOpen(true)}
            className="flex items-start gap-3 rounded-xl border border-border bg-background p-3 text-left transition hover:border-primary/40"
          >
            <FileSpreadsheet className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
            <span>
              <span className="block text-sm font-semibold">
                Import products
              </span>
              <span className="mt-0.5 block text-xs text-muted-foreground">
                Excel / CSV — name, cost, sell, units
              </span>
              {productDone ? (
                <span className="mt-1 inline-flex items-center gap-1 text-[11px] text-emerald-600">
                  <CheckCircle2 className="h-3 w-3" /> products exist
                </span>
              ) : null}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setOpeningImportOpen(true)}
            className="flex items-start gap-3 rounded-xl border border-border bg-background p-3 text-left transition hover:border-primary/40"
          >
            <Upload className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
            <span>
              <span className="block text-sm font-semibold">
                Import opening stock
              </span>
              <span className="mt-0.5 block text-xs text-muted-foreground">
                SKU + qty (+ batch/expiry if needed)
              </span>
              {stockDone ? (
                <span className="mt-1 inline-flex items-center gap-1 text-[11px] text-emerald-600">
                  <CheckCircle2 className="h-3 w-3" /> stock on hand
                </span>
              ) : null}
            </span>
          </button>

          <Link
            href="/inventory/starter-kits"
            className="flex items-start gap-3 rounded-xl border border-border bg-background p-3 transition hover:border-primary/40"
          >
            <PackagePlus className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
            <span>
              <span className="block text-sm font-semibold">
                Starter kits (pick lines)
              </span>
              <span className="mt-0.5 block text-xs text-muted-foreground">
                Review and add only what is on the shelf
              </span>
            </span>
          </Link>

          <Link
            href="/inventory/stock/receive"
            className="flex items-start gap-3 rounded-xl border border-border bg-background p-3 transition hover:border-primary/40"
          >
            <Upload className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
            <span>
              <span className="block text-sm font-semibold">
                Receive / opening on screen
              </span>
              <span className="mt-0.5 block text-xs text-muted-foreground">
                Manual receive into MAIN warehouse
              </span>
            </span>
          </Link>
        </div>
      </section>

      {/* Day blocks */}
      <div className="space-y-5">
        {blocks.map((block, bi) => (
          <section
            key={block.id}
            className="rounded-2xl border border-border bg-card shadow-sm"
          >
            <div className="border-b border-border px-4 py-3 sm:px-5">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                {block.when}
              </p>
              <h2 className="text-base font-semibold tracking-tight">
                {bi + 3}. {block.title}
              </h2>
            </div>
            <ul className="divide-y divide-border">
              {block.tasks.map((task) => {
                const done = taskDone(task, checks);
                return (
                  <li
                    key={task.id}
                    className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between sm:px-5"
                  >
                    <div className="flex min-w-0 gap-3">
                      <span className="mt-0.5 shrink-0">
                        {done === true ? (
                          <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                        ) : (
                          <Circle
                            className={cn(
                              "h-5 w-5",
                              done === false
                                ? "text-amber-600 dark:text-amber-400"
                                : "text-muted-foreground/50",
                            )}
                          />
                        )}
                      </span>
                      <div className="min-w-0">
                        <p className="font-medium leading-snug">{task.title}</p>
                        <p className="mt-0.5 text-sm text-muted-foreground">
                          {task.detail}
                        </p>
                        <p className="mt-1 text-[11px] text-muted-foreground">
                          ~{task.minutes} min
                          {done === true ? " · done in system" : null}
                          {done === false ? " · still open" : null}
                        </p>
                      </div>
                    </div>
                    <Link
                      href={task.href}
                      className={cn(
                        "inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-xl px-4 text-sm font-semibold transition",
                        done === true
                          ? "border border-border bg-muted/40 text-muted-foreground hover:bg-muted"
                          : "bg-primary text-primary-foreground shadow-sm hover:opacity-95",
                      )}
                    >
                      {task.hrefLabel}
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </li>
                );
              })}
            </ul>
          </section>
        ))}
      </div>

      {/* Footer CTAs */}
      <footer className="flex flex-col gap-3 rounded-2xl border border-border bg-muted/30 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
        <div>
          <p className="font-medium">Ready to open the till?</p>
          <p className="text-sm text-muted-foreground">
            When products and stock exist, POS is the proof of go-live.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/settings/readiness"
            className="inline-flex h-10 items-center rounded-xl border border-border bg-card px-4 text-sm font-medium"
          >
            Full readiness score
          </Link>
          <Link
            href="/sales/pos"
            className="inline-flex h-10 items-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground"
          >
            Open POS
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </footer>

      <ProductImportDialog
        open={productImportOpen}
        onOpenChange={setProductImportOpen}
        onImported={() => router.refresh()}
      />
      <OpeningStockImportDialog
        open={openingImportOpen}
        onOpenChange={setOpeningImportOpen}
        onImported={() => router.refresh()}
      />
    </div>
  );
}
