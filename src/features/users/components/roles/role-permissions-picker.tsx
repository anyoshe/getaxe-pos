"use client";

import { useMemo, useState } from "react";

import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export type PermissionOption = {
  id: string;
  code: string;
  module: string;
  name: string;
  description: string | null;
};

export function RolePermissionsPicker({
  permissions,
  selectedIds,
  onChange,
  readOnly,
}: {
  permissions: PermissionOption[];
  selectedIds: string[];
  onChange: (ids: string[]) => void;
  readOnly?: boolean;
}) {
  const [query, setQuery] = useState("");
  const selected = useMemo(() => new Set(selectedIds), [selectedIds]);

  const grouped = useMemo(() => {
    const q = query.trim().toLowerCase();
    const map = new Map<string, PermissionOption[]>();
    for (const p of permissions) {
      if (
        q &&
        !p.code.toLowerCase().includes(q) &&
        !p.name.toLowerCase().includes(q) &&
        !p.module.toLowerCase().includes(q)
      ) {
        continue;
      }
      const list = map.get(p.module) ?? [];
      list.push(p);
      map.set(p.module, list);
    }
    return [...map.entries()].sort((a, b) => a[0].localeCompare(b[0]));
  }, [permissions, query]);

  function toggle(id: string, checked: boolean) {
    if (readOnly) return;
    if (checked) onChange([...selectedIds, id]);
    else onChange(selectedIds.filter((x) => x !== id));
  }

  function setModule(module: string, ids: string[], on: boolean) {
    if (readOnly) return;
    const set = new Set(selectedIds);
    for (const id of ids) {
      if (on) set.add(id);
      else set.delete(id);
    }
    onChange([...set]);
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <Input
          className="max-w-sm"
          placeholder="Search permissions (code, name, module)…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <span className="text-xs text-muted-foreground">
          {selectedIds.length} selected · {permissions.length} total
        </span>
        {!readOnly ? (
          <>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => onChange(permissions.map((p) => p.id))}
            >
              Select all
            </Button>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={() => onChange([])}
            >
              Clear all
            </Button>
          </>
        ) : null}
      </div>

      <div className="max-h-[28rem] space-y-4 overflow-y-auto rounded-xl border p-3">
        {grouped.length === 0 ? (
          <p className="p-4 text-center text-sm text-muted-foreground">
            No permissions match.
          </p>
        ) : (
          grouped.map(([module, list]) => {
            const allOn = list.every((p) => selected.has(p.id));
            return (
              <div key={module} className="space-y-2">
                <div className="flex items-center justify-between gap-2 border-b pb-1">
                  <h5 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    {module}
                  </h5>
                  {!readOnly ? (
                    <button
                      type="button"
                      className="text-xs text-primary hover:underline"
                      onClick={() =>
                        setModule(
                          module,
                          list.map((p) => p.id),
                          !allOn,
                        )
                      }
                    >
                      {allOn ? "Clear module" : "Select module"}
                    </button>
                  ) : null}
                </div>
                <div className="grid gap-2 sm:grid-cols-2">
                  {list.map((p) => (
                    <label
                      key={p.id}
                      className="flex cursor-pointer items-start gap-2 rounded-lg border border-transparent px-2 py-1.5 hover:border-border hover:bg-muted/40"
                    >
                      <Checkbox
                        checked={selected.has(p.id)}
                        disabled={readOnly}
                        onCheckedChange={(c) => toggle(p.id, Boolean(c))}
                      />
                      <span className="min-w-0">
                        <span className="block text-sm font-medium leading-tight">
                          {p.name}
                        </span>
                        <span className="block font-mono text-[11px] text-muted-foreground">
                          {p.code}
                        </span>
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
