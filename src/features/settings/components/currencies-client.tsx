"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import {
  convertAmountAction,
  upsertExchangeRateAction,
} from "../actions/fx-ui";

type Rate = {
  id: string;
  fromCurrency: string;
  toCurrency: string;
  rate: string;
  effectiveDate: string;
  active: boolean;
};

export function CurrenciesClient({
  baseCurrency,
  catalogue,
  rates,
}: {
  baseCurrency: string;
  catalogue: { code: string; name: string; symbol: string }[];
  rates: Rate[];
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [from, setFrom] = useState("USD");
  const [to, setTo] = useState(baseCurrency || "KES");
  const [rate, setRate] = useState("130");
  const [amount, setAmount] = useState(100);
  const [converted, setConverted] = useState<string | null>(null);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Currencies & FX</h1>
        <p className="text-sm text-muted-foreground">
          Base currency: <strong>{baseCurrency}</strong>. Add live rates to convert
          amounts for display and foreign-currency documents.
        </p>
      </div>

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="space-y-3 rounded-xl border border-primary/20 bg-primary/5 p-4">
          <h2 className="font-semibold">Exchange rates</h2>
          <div className="grid gap-2 sm:grid-cols-3">
            <div className="space-y-1">
              <Label>From</Label>
              <Input value={from} onChange={(e) => setFrom(e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label>To</Label>
              <Input value={to} onChange={(e) => setTo(e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label>Rate (1 from = ? to)</Label>
              <Input
                type="number"
                step="0.000001"
                value={rate}
                onChange={(e) => setRate(e.target.value)}
              />
            </div>
          </div>
          <Button
            type="button"
            disabled={pending}
            onClick={() =>
              start(async () => {
                const r = await upsertExchangeRateAction({
                  fromCurrency: from,
                  toCurrency: to,
                  rate: Number(rate),
                });
                if (!r.success) toast.error(r.message);
                else {
                  toast.success(r.message);
                  router.refresh();
                }
              })
            }
          >
            Save rate
          </Button>
        </div>

        <div className="space-y-3 rounded-xl border p-4">
          <h2 className="font-semibold">Convert amount</h2>
          <div className="grid gap-2 sm:grid-cols-3">
            <div className="space-y-1">
              <Label>Amount</Label>
              <Input
                type="number"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value) || 0)}
              />
            </div>
            <div className="space-y-1">
              <Label>From</Label>
              <Input value={from} onChange={(e) => setFrom(e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label>To</Label>
              <Input value={to} onChange={(e) => setTo(e.target.value)} />
            </div>
          </div>
          <Button
            type="button"
            variant="outline"
            disabled={pending}
            onClick={() =>
              start(async () => {
                const r = await convertAmountAction({
                  amount,
                  fromCurrency: from,
                  toCurrency: to,
                });
                if (!r.success) {
                  toast.error(r.message);
                  setConverted(null);
                } else {
                  setConverted(
                    `${amount} ${from} = ${r.amount.toFixed(4)} ${to} (rate ${r.rate.toFixed(6)}, ${r.path})`,
                  );
                }
              })
            }
          >
            Convert
          </Button>
          {converted ? (
            <p className="text-sm font-medium text-primary">{converted}</p>
          ) : null}
        </div>
      </section>

      <div className="overflow-x-auto rounded-xl border">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-left">
            <tr>
              <th className="p-3">Pair</th>
              <th className="p-3">Rate</th>
              <th className="p-3">Effective</th>
            </tr>
          </thead>
          <tbody>
            {rates.length === 0 ? (
              <tr>
                <td colSpan={3} className="p-6 text-center text-muted-foreground">
                  No rates yet. Add e.g. USD → {baseCurrency}.
                </td>
              </tr>
            ) : (
              rates.map((r) => (
                <tr key={r.id} className="border-t">
                  <td className="p-3 font-mono text-xs">
                    {r.fromCurrency}/{r.toCurrency}
                  </td>
                  <td className="p-3 tabular-nums">{r.rate}</td>
                  <td className="p-3">{r.effectiveDate}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {catalogue.length > 0 ? (
        <div className="overflow-x-auto rounded-xl border">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-left">
              <tr>
                <th className="p-3">Code</th>
                <th className="p-3">Name</th>
                <th className="p-3">Symbol</th>
              </tr>
            </thead>
            <tbody>
              {catalogue.map((c) => (
                <tr key={c.code} className="border-t">
                  <td className="p-3 font-mono text-xs">{c.code}</td>
                  <td className="p-3">{c.name}</td>
                  <td className="p-3">{c.symbol}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </div>
  );
}
