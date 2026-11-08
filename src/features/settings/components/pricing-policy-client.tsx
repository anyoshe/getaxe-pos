"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";

import {
  savePricingPolicyAction,
  type BelowCostPolicy,
} from "../actions/pricing-policy";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

const OPTIONS: Array<{
  value: BelowCostPolicy;
  title: string;
  desc: string;
}> = [
  {
    value: "block",
    title: "Block sale",
    desc: "POS cannot complete if any line is at or below book cost. Recommended for most shops.",
  },
  {
    value: "warn",
    title: "Warn only",
    desc: "Cashier sees a warning but can still complete (manager discretion / clearance sales).",
  },
  {
    value: "off",
    title: "Allow silently",
    desc: "No check. Use only if you price outside GetAxe or run intentional loss leaders.",
  },
];

export function PricingPolicyClient({
  initialPolicy,
  initialFooter,
  businessName,
}: {
  initialPolicy: BelowCostPolicy;
  initialFooter: string | null;
  businessName: string;
}) {
  const [policy, setPolicy] = useState<BelowCostPolicy>(initialPolicy);
  const [footer, setFooter] = useState(initialFooter ?? "");
  const [pending, start] = useTransition();

  function save() {
    start(async () => {
      const r = await savePricingPolicyAction({
        belowCostSalePolicy: policy,
        documentFooter: footer,
      });
      if (!r.success) {
        toast.error(r.message);
        return;
      }
      toast.success("Pricing & document branding saved.");
    });
  }

  return (
    <div className="mx-auto max-w-xl space-y-8">
      <header>
        <h1 className="text-2xl font-bold tracking-tight">
          Pricing & document branding
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {businessName} — control below-cost sales and what appears on printed
          documents.
        </p>
      </header>

      <section className="space-y-3 rounded-2xl border border-border bg-card p-5">
        <h2 className="font-semibold">Below-cost sale policy (C3)</h2>
        <p className="text-sm text-muted-foreground">
          Compares POS unit price to product cost × pack factor. Applies on the
          counter and is enforced on the server when set to Block.
        </p>
        <div className="space-y-2">
          {OPTIONS.map((o) => (
            <label
              key={o.value}
              className={`flex cursor-pointer gap-3 rounded-xl border p-3 transition ${
                policy === o.value
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/30"
              }`}
            >
              <input
                type="radio"
                name="policy"
                className="mt-1"
                checked={policy === o.value}
                onChange={() => setPolicy(o.value)}
              />
              <span>
                <span className="font-medium">{o.title}</span>
                <span className="mt-0.5 block text-sm text-muted-foreground">
                  {o.desc}
                </span>
              </span>
            </label>
          ))}
        </div>
      </section>

      <section className="space-y-3 rounded-2xl border border-border bg-card p-5">
        <h2 className="font-semibold">Document footer (status branding)</h2>
        <p className="text-sm text-muted-foreground">
          Shown on receipts and purchase orders under your business details.
          Example: “Thank you · GetAxe pilot shop” or your tagline.
        </p>
        <Label htmlFor="footer">Footer line</Label>
        <input
          id="footer"
          value={footer}
          onChange={(e) => setFooter(e.target.value)}
          maxLength={200}
          placeholder="e.g. Thank you for shopping with us"
          className="h-10 w-full rounded-xl border border-border bg-background px-3 text-sm"
        />
      </section>

      <Button onClick={save} disabled={pending} className="w-full sm:w-auto">
        {pending ? "Saving…" : "Save"}
      </Button>
    </div>
  );
}
