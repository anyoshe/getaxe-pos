"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { setCapabilityEnabledAction } from "../actions/capabilities-ui";

type Cap = {
  id: string;
  name: string;
  description: string;
  module: string;
  category: string;
  enabled: boolean;
};

export function CapabilitiesClient({ initial }: { initial: Cap[] }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [query, setQuery] = useState("");
  const [rows, setRows] = useState(initial);

  const grouped = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = rows.filter(
      (c) =>
        !q ||
        c.id.toLowerCase().includes(q) ||
        c.name.toLowerCase().includes(q) ||
        c.module.toLowerCase().includes(q),
    );
    const map = new Map<string, Cap[]>();
    for (const c of filtered) {
      const list = map.get(c.module) ?? [];
      list.push(c);
      map.set(c.module, list);
    }
    return [...map.entries()].sort((a, b) => a[0].localeCompare(b[0]));
  }, [rows, query]);

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
          Turn features on or off independently of business type. Product
          wizard, pharmacy fields, serials, batches, and more follow these
          switches.
        </p>
      </div>

      <Input
        placeholder="Search capabilities…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="max-w-md"
      />

      {grouped.map(([module, caps]) => (
        <section key={module} className="space-y-2">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            {module}
          </h2>
          <div className="overflow-hidden rounded-xl border">
            {caps.map((c) => (
              <div
                key={c.id}
                className="flex flex-wrap items-center justify-between gap-3 border-t first:border-t-0 px-4 py-3"
              >
                <div className="min-w-0">
                  <div className="font-medium">{c.name}</div>
                  <div className="text-xs text-muted-foreground">{c.id}</div>
                  {c.description ? (
                    <p className="mt-1 text-sm text-muted-foreground">
                      {c.description}
                    </p>
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
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
