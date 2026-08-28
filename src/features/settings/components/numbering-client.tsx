"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import {
  ensureNumberingSequencesAction,
  updateNumberingSequenceAction,
} from "../actions/settings-ui";

type Seq = {
  id: string;
  documentType: string;
  prefix: string;
  nextNumber: number;
  numberLength: number;
  separator: string;
  active: boolean;
};

export function NumberingClient({ sequences }: { sequences: Seq[] }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [rows, setRows] = useState(sequences);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Document numbering
          </h1>
          <p className="text-sm text-muted-foreground">
            Prefixes and next numbers for invoices, POs, GRNs, and other
            documents.
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          disabled={pending}
          onClick={() =>
            start(async () => {
              const r = await ensureNumberingSequencesAction();
              if (!r.success) toast.error(r.message);
              else {
                toast.success(r.message);
                router.refresh();
              }
            })
          }
        >
          Ensure defaults
        </Button>
      </div>

      <div className="overflow-x-auto rounded-xl border">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-left">
            <tr>
              <th className="p-3">Document</th>
              <th className="p-3">Prefix</th>
              <th className="p-3">Next #</th>
              <th className="p-3">Length</th>
              <th className="p-3">Sep</th>
              <th className="p-3">Preview</th>
              <th className="p-3" />
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-6 text-center text-muted-foreground">
                  No sequences yet. Click Ensure defaults.
                </td>
              </tr>
            ) : (
              rows.map((s, i) => {
                const preview = `${s.prefix}${s.separator}${String(
                  s.nextNumber,
                ).padStart(s.numberLength, "0")}`;
                return (
                  <tr key={s.id} className="border-t">
                    <td className="p-3 font-medium">{s.documentType}</td>
                    <td className="p-3">
                      <Input
                        className="h-8 w-24"
                        value={s.prefix}
                        onChange={(e) => {
                          const v = e.target.value;
                          setRows((r) =>
                            r.map((x, j) =>
                              j === i ? { ...x, prefix: v } : x,
                            ),
                          );
                        }}
                      />
                    </td>
                    <td className="p-3">
                      <Input
                        className="h-8 w-20"
                        type="number"
                        value={s.nextNumber}
                        onChange={(e) => {
                          const v = Number(e.target.value) || 1;
                          setRows((r) =>
                            r.map((x, j) =>
                              j === i ? { ...x, nextNumber: v } : x,
                            ),
                          );
                        }}
                      />
                    </td>
                    <td className="p-3">
                      <Input
                        className="h-8 w-16"
                        type="number"
                        value={s.numberLength}
                        onChange={(e) => {
                          const v = Number(e.target.value) || 6;
                          setRows((r) =>
                            r.map((x, j) =>
                              j === i ? { ...x, numberLength: v } : x,
                            ),
                          );
                        }}
                      />
                    </td>
                    <td className="p-3">
                      <Input
                        className="h-8 w-12"
                        value={s.separator}
                        onChange={(e) => {
                          const v = e.target.value;
                          setRows((r) =>
                            r.map((x, j) =>
                              j === i ? { ...x, separator: v } : x,
                            ),
                          );
                        }}
                      />
                    </td>
                    <td className="p-3 font-mono text-xs">{preview}</td>
                    <td className="p-3">
                      <Button
                        type="button"
                        size="sm"
                        disabled={pending}
                        onClick={() =>
                          start(async () => {
                            const r = await updateNumberingSequenceAction(s);
                            if (!r.success) toast.error(r.message);
                            else toast.success(r.message);
                          })
                        }
                      >
                        Save
                      </Button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
