"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { saveMpesaSettingsAction } from "@/features/finance/actions/mpesa";

type Settings = {
  enabled: boolean;
  environment: string;
  shortcodeType: string;
  shortcode: string;
  accountReference: string;
  transactionDesc: string;
  simulationMode: boolean;
  hasCredentials: boolean;
};

export function MpesaSettingsClient({ initial }: { initial: Settings }) {
  const [pending, start] = useTransition();
  const [enabled, setEnabled] = useState(initial.enabled);
  const [environment, setEnvironment] = useState(
    initial.environment === "production" ? "production" : "sandbox",
  );
  const [shortcodeType, setShortcodeType] = useState(
    initial.shortcodeType === "PAYBILL" ? "PAYBILL" : "TILL",
  );
  const [shortcode, setShortcode] = useState(initial.shortcode || "");
  const [accountReference, setAccountReference] = useState(
    initial.accountReference || "GetAxe",
  );
  const [transactionDesc, setTransactionDesc] = useState(
    initial.transactionDesc || "POS Sale",
  );
  const [simulationMode, setSimulationMode] = useState(
    initial.simulationMode !== false,
  );
  const [consumerKey, setConsumerKey] = useState("");
  const [consumerSecret, setConsumerSecret] = useState("");
  const [passkey, setPasskey] = useState("");

  function save() {
    start(async () => {
      const r = await saveMpesaSettingsAction({
        enabled,
        environment,
        shortcodeType,
        shortcode,
        accountReference,
        transactionDesc,
        simulationMode,
        consumerKey: consumerKey || null,
        consumerSecret: consumerSecret || null,
        passkey: passkey || null,
        updateSecrets: Boolean(consumerKey || consumerSecret || passkey),
      });
      if (!r.success) {
        toast.error(r.message);
        return;
      }
      toast.success(r.message);
      setConsumerKey("");
      setConsumerSecret("");
      setPasskey("");
    });
  }

  return (
    <div className="space-y-5 rounded-2xl border bg-card p-4 shadow-sm md:p-6">
      <label className="flex items-center gap-2 text-sm font-medium">
        <input
          type="checkbox"
          checked={enabled}
          onChange={(e) => setEnabled(e.target.checked)}
          className="h-4 w-4 rounded border"
        />
        Enable M-Pesa STK on POS
      </label>

      <label className="flex items-start gap-2 text-sm">
        <input
          type="checkbox"
          checked={simulationMode}
          onChange={(e) => setSimulationMode(e.target.checked)}
          className="mt-1 h-4 w-4 rounded border"
        />
        <span>
          <span className="font-medium">Simulation mode</span>
          <span className="mt-0.5 block text-xs text-muted-foreground">
            No call to Safaricom — STK succeeds with a fake receipt. Use for
            training until Daraja keys are ready. Turn off for live Till/Paybill.
          </span>
        </span>
      </label>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1">
          <Label>Environment</Label>
          <select
            className="h-10 w-full rounded-xl border border-input bg-background px-3 text-sm"
            value={environment}
            onChange={(e) => setEnvironment(e.target.value)}
          >
            <option value="sandbox">Sandbox</option>
            <option value="production">Production</option>
          </select>
        </div>
        <div className="space-y-1">
          <Label>Shortcode type</Label>
          <select
            className="h-10 w-full rounded-xl border border-input bg-background px-3 text-sm"
            value={shortcodeType}
            onChange={(e) => setShortcodeType(e.target.value)}
          >
            <option value="TILL">Till (Buy Goods)</option>
            <option value="PAYBILL">Paybill</option>
          </select>
        </div>
      </div>

      <div className="space-y-1">
        <Label>Till / Paybill number</Label>
        <Input
          value={shortcode}
          onChange={(e) => setShortcode(e.target.value)}
          placeholder="e.g. 174379 (sandbox) or your till"
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1">
          <Label>Account reference</Label>
          <Input
            value={accountReference}
            onChange={(e) => setAccountReference(e.target.value)}
            maxLength={12}
          />
        </div>
        <div className="space-y-1">
          <Label>Transaction description</Label>
          <Input
            value={transactionDesc}
            onChange={(e) => setTransactionDesc(e.target.value)}
            maxLength={13}
          />
        </div>
      </div>

      <div className="rounded-xl border border-dashed bg-muted/30 p-3">
        <p className="mb-2 text-xs font-medium text-muted-foreground">
          Daraja API credentials{" "}
          {initial.hasCredentials
            ? "(saved — leave blank to keep)"
            : "(optional in simulation)"}
        </p>
        <div className="space-y-2">
          <Input
            type="password"
            autoComplete="off"
            placeholder="Consumer key"
            value={consumerKey}
            onChange={(e) => setConsumerKey(e.target.value)}
          />
          <Input
            type="password"
            autoComplete="off"
            placeholder="Consumer secret"
            value={consumerSecret}
            onChange={(e) => setConsumerSecret(e.target.value)}
          />
          <Input
            type="password"
            autoComplete="off"
            placeholder="Lipa Na M-Pesa passkey"
            value={passkey}
            onChange={(e) => setPasskey(e.target.value)}
          />
        </div>
      </div>

      <p className="text-xs text-muted-foreground">
        Callback URL (register in Daraja):{" "}
        <code className="rounded bg-muted px-1">
          {"{your-domain}"}/api/mpesa/callback
        </code>
        . Link an M-Pesa till under Finance → Cash &amp; bank so POS posts to the
        right ledger.
      </p>

      <Button type="button" disabled={pending} onClick={save} className="w-full sm:w-auto">
        {pending ? "Saving…" : "Save M-Pesa settings"}
      </Button>
    </div>
  );
}
