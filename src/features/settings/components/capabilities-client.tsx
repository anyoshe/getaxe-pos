"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  getCapabilityWiring,
  type CapabilityWiringStatus,
} from "@/features/capabilities/constants/capability-wiring";

import { setCapabilityEnabledAction } from "../actions/capabilities-ui";

type Cap = {
  id: string;
  name: string;
  description: string;
  module: string;
  category: string;
  enabled: boolean;
  dependencies?: string[];
};

const STATUS_LABEL: Record<CapabilityWiringStatus, string> = {
  wired: "Live in app",
  partial: "Partial",
  roadmap: "Roadmap",
};

const STATUS_CLASS: Record<CapabilityWiringStatus, string> = {
  wired: "bg-chart-4/15 text-chart-4",
  partial: "bg-chart-2/15 text-chart-2",
  roadmap: "bg-muted text-muted-foreground",
};

export function CapabilitiesClient({ initial }: { initial: Cap[] }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | CapabilityWiringStatus
  >("all");
  const [rows, setRows] = useState(initial);

  const stats = useMemo(() => {
    let wired = 0;
    let partial = 0;
    let roadmap = 0;
    for (const c of rows) {
      const s = getCapabilityWiring(c.id).status;
      if (s === "wired") wired++;
      else if (s === "partial") partial++;
      else roadmap++;
    }
    return { wired, partial, roadmap, enabled: rows.filter((r) => r.enabled).length };
  }, [rows]);

  const grouped = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = rows.filter((c) => {
      const wiring = getCapabilityWiring(c.id);
      if (statusFilter !== "all" && wiring.status !== statusFilter) return false;
      if (!q) return true;
      return (
        c.id.toLowerCase().includes(q) ||
        c.name.toLowerCase().includes(q) ||
        c.module.toLowerCase().includes(q)
      );
    });
    const map = new Map<string, Cap[]>();
    for (const c of filtered) {
      const list = map.get(c.module) ?? [];
      list.push(c);
      map.set(c.module, list);
    }
    return [...map.entries()].sort((a, b) => a[0].localeCompare(b[0]));
  }, [rows, query, statusFilter]);

  function toggle(cap: Cap) {
    start(async () => {
      const next = !cap.enabled;
      const r = await setCapabilityEnabledAction({
        capabilityId: cap.id,
        enabled: next,
      });
      if (!r.success) {
        toast.error(r.message);
        return;
      }
      setRows((prev) =>
        prev.map((x) => (x.id === cap.id ? { ...x, enabled: next } : x)),
      );
      toast.success(r.message);
      router.refresh();
    });
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Business capabilities
        </h1>
        <p className="text-sm text-muted-foreground">
          Feature switches independent of business type.{" "}
          <span className="font-medium text-foreground">Live in app</span>{" "}
          capabilities change screens and validation.{" "}
          <span className="font-medium text-foreground">Roadmap</span> entries
          are catalogue placeholders until a module is built.
        </p>
      </div>

      <div className="flex flex-wrap gap-2 text-xs">
        <span className="rounded-full bg-primary/10 px-3 py-1 font-medium text-primary">
          {stats.enabled} enabled
        </span>
        <span className={`rounded-full px-3 py-1 font-medium ${STATUS_CLASS.wired}`}>
          {stats.wired} live
        </span>
        <span className={`rounded-full px-3 py-1 font-medium ${STATUS_CLASS.partial}`}>
          {stats.partial} partial
        </span>
        <span className={`rounded-full px-3 py-1 font-medium ${STATUS_CLASS.roadmap}`}>
          {stats.roadmap} roadmap
        </span>
      </div>

      <div className="flex flex-wrap gap-2">
        <Input
          placeholder="Search capabilities…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="max-w-md"
        />
        {(
          [
            ["all", "All"],
            ["wired", "Live"],
            ["partial", "Partial"],
            ["roadmap", "Roadmap"],
          ] as const
        ).map(([id, label]) => (
          <Button
            key={id}
            type="button"
            size="sm"
            variant={statusFilter === id ? "default" : "outline"}
            className="rounded-xl"
            onClick={() => setStatusFilter(id)}
          >
            {label}
          </Button>
        ))}
      </div>

      {grouped.map(([module, caps]) => (
        <section key={module} className="space-y-2">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            {module}
          </h2>
          <div className="overflow-hidden rounded-xl border bg-card">
            {caps.map((c) => {
              const wiring = getCapabilityWiring(c.id);
              return (
                <div
                  key={c.id}
                  className="flex flex-wrap items-center justify-between gap-3 border-t border-border px-4 py-3 first:border-t-0"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-medium text-foreground">
                        {c.name}
                      </span>
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${STATUS_CLASS[wiring.status]}`}
                      >
                        {STATUS_LABEL[wiring.status]}
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground">{c.id}</div>
                    {c.description ? (
                      <p className="mt-1 text-sm text-muted-foreground">
                        {c.description}
                      </p>
                    ) : null}
                    {wiring.note ? (
                      <p className="mt-1 text-xs text-muted-foreground">
                        {wiring.note}
                      </p>
                    ) : null}
                    {c.dependencies && c.dependencies.length > 0 ? (
                      <p className="mt-1 text-[11px] text-muted-foreground">
                        Needs: {c.dependencies.join(", ")}
                      </p>
                    ) : null}
                    {wiring.routes && wiring.routes.length > 0 ? (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {wiring.routes.map((href) => (
                          <Link
                            key={href}
                            href={href}
                            className="text-xs font-medium text-primary underline-offset-4 hover:underline"
                          >
                            Open {href}
                          </Link>
                        ))}
                      </div>
                    ) : null}
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    variant={c.enabled ? "default" : "outline"}
                    disabled={pending}
                    onClick={() => toggle(c)}
                  >
                    {c.enabled ? "Enabled" : "Disabled"}
                  </Button>
                </div>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}
