"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { saveEtimsSettingsAction } from "@/features/finance/actions/etims";

export type EtimsSettingsInitial = {
  enabled: boolean;
  environment: "simulation" | "sandbox" | "production";
  kraPin: string;
  branchId: string;
  deviceSerial: string;
  notes: string;
};

export function EtimsSettingsClient({
  initial,
}: {
  initial: EtimsSettingsInitial;
}) {
  const [enabled, setEnabled] = useState(initial.enabled);
  const [environment, setEnvironment] = useState(initial.environment);
  const [kraPin, setKraPin] = useState(initial.kraPin);
  const [branchId, setBranchId] = useState(initial.branchId);
  const [deviceSerial, setDeviceSerial] = useState(initial.deviceSerial);
  const [notes, setNotes] = useState(initial.notes);
  const [pending, start] = useTransition();

  function save() {
    start(async () => {
      const r = await saveEtimsSettingsAction({
        enabled,
        environment,
        kraPin,
        branchId,
        deviceSerial,
        notes,
      });
      if (!r.success) {
        toast.error(r.message);
        return;
      }
      toast.success(r.message);
    });
  }

  return (
    <div className="space-y-5 rounded-2xl border bg-card p-4 shadow-sm md:p-6">
      <label className="flex items-start gap-2 text-sm font-medium">
        <input
          type="checkbox"
          checked={enabled}
          onChange={(e) => setEnabled(e.target.checked)}
          className="mt-0.5 h-4 w-4 rounded border"
        />
        <span>
          Enable eTIMS path for this business
          <span className="mt-0.5 block text-xs font-normal text-muted-foreground">
            When off, POS and invoices work as today with normal receipts. When
            on, each completed sale is stamped according to the mode below.
          </span>
        </span>
      </label>

      <div className="space-y-1">
        <Label>Mode</Label>
        <select
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
          value={environment}
          onChange={(e) =>
            setEnvironment(e.target.value as EtimsSettingsInitial["environment"])
          }
        >
          <option value="simulation">Simulation (demo stamps — no KRA)</option>
          <option value="sandbox">Sandbox (Phase B live test later)</option>
          <option value="production">Production (Phase B live later)</option>
        </select>
        <p className="text-xs text-muted-foreground">
          Simulation writes a clear SIM-… CU number on the sale and receipt so
          you can train and demo. Sandbox/production wait for Phase B (KRA /
          certified integrator) — sales still complete without blocking the
          counter.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1">
          <Label>Business KRA PIN</Label>
          <Input
            value={kraPin}
            onChange={(e) => setKraPin(e.target.value)}
            placeholder="P0512xxxxxx"
            autoComplete="off"
          />
        </div>
        <div className="space-y-1">
          <Label>eTIMS branch ID</Label>
          <Input
            value={branchId}
            onChange={(e) => setBranchId(e.target.value)}
            placeholder="From KRA eTIMS portal"
            autoComplete="off"
          />
        </div>
        <div className="space-y-1 sm:col-span-2">
          <Label>Device / CU serial (optional)</Label>
          <Input
            value={deviceSerial}
            onChange={(e) => setDeviceSerial(e.target.value)}
            placeholder="When issued by KRA or integrator"
            autoComplete="off"
          />
        </div>
        <div className="space-y-1 sm:col-span-2">
          <Label>Internal notes</Label>
          <Input
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g. awaiting sandbox access"
          />
        </div>
      </div>

      <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-3 text-xs text-muted-foreground">
        <p className="font-medium text-foreground">Phase A scope</p>
        <ul className="mt-1 list-inside list-disc space-y-0.5">
          <li>On/off and credentials stored per business (like M-Pesa).</li>
          <li>Simulation stamps are labelled and are not valid tax invoices.</li>
          <li>
            Live KRA OSCU/VSCU signing is Phase B after portal access or a
            certified integrator.
          </li>
        </ul>
      </div>

      <Button type="button" onClick={save} disabled={pending} className="w-full sm:w-auto">
        {pending ? "Saving…" : "Save eTIMS settings"}
      </Button>
    </div>
  );
}
