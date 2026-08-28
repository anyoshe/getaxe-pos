"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import {
  updateBusinessProfileAction,
  updateBusinessSettingsAction,
} from "../actions/settings-ui";

type Profile = {
  name: string;
  legalName: string | null;
  registrationNumber: string | null;
  kraPin: string | null;
  email: string | null;
  phone: string | null;
  website: string | null;
  county: string | null;
  town: string | null;
  address: string | null;
  currency: string;
  businessType: string;
  country: string;
  timezone: string;
};

type Ops = {
  allowNegativeStock: boolean;
  trackInventoryByBatch: boolean;
  enableExpiryTracking: boolean;
  requireCustomerOnSale: boolean;
  requireSupplierOnPurchase: boolean;
  allowBackdatedTransactions: boolean;
  autoPostJournals: boolean;
};

export function BusinessProfileClient({
  profile,
  ops,
}: {
  profile: Profile;
  ops: Ops;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [form, setForm] = useState(profile);
  const [flags, setFlags] = useState(ops);

  function setField<K extends keyof Profile>(key: K, value: Profile[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Business profile</h1>
        <p className="text-sm text-muted-foreground">
          Legal identity and operational defaults for this organisation.
        </p>
      </div>

      <section className="space-y-4 rounded-xl border border-primary/20 bg-primary/5 p-4">
        <h2 className="font-semibold">Identity</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Trading name *">
            <Input value={form.name} onChange={(e) => setField("name", e.target.value)} />
          </Field>
          <Field label="Legal name">
            <Input
              value={form.legalName ?? ""}
              onChange={(e) => setField("legalName", e.target.value)}
            />
          </Field>
          <Field label="Registration number">
            <Input
              value={form.registrationNumber ?? ""}
              onChange={(e) => setField("registrationNumber", e.target.value)}
            />
          </Field>
          <Field label="KRA PIN">
            <Input
              value={form.kraPin ?? ""}
              onChange={(e) => setField("kraPin", e.target.value)}
            />
          </Field>
          <Field label="Email">
            <Input
              value={form.email ?? ""}
              onChange={(e) => setField("email", e.target.value)}
            />
          </Field>
          <Field label="Phone">
            <Input
              value={form.phone ?? ""}
              onChange={(e) => setField("phone", e.target.value)}
            />
          </Field>
          <Field label="Website">
            <Input
              value={form.website ?? ""}
              onChange={(e) => setField("website", e.target.value)}
            />
          </Field>
          <Field label="Currency">
            <Input
              value={form.currency}
              onChange={(e) => setField("currency", e.target.value)}
            />
          </Field>
          <Field label="County">
            <Input
              value={form.county ?? ""}
              onChange={(e) => setField("county", e.target.value)}
            />
          </Field>
          <Field label="Town">
            <Input
              value={form.town ?? ""}
              onChange={(e) => setField("town", e.target.value)}
            />
          </Field>
          <Field label="Address">
            <Input
              value={form.address ?? ""}
              onChange={(e) => setField("address", e.target.value)}
            />
          </Field>
          <div className="space-y-1 text-sm text-muted-foreground">
            <div>Type: {form.businessType}</div>
            <div>Country: {form.country}</div>
            <div>Timezone: {form.timezone}</div>
          </div>
        </div>
        <Button
          type="button"
          disabled={pending}
          onClick={() =>
            start(async () => {
              const r = await updateBusinessProfileAction(form);
              if (!r.success) toast.error(r.message);
              else {
                toast.success(r.message);
                router.refresh();
              }
            })
          }
        >
          Save profile
        </Button>
      </section>

      <section className="space-y-4 rounded-xl border p-4">
        <h2 className="font-semibold">Operational defaults</h2>
        <div className="grid gap-2 sm:grid-cols-2">
          {(
            [
              ["allowNegativeStock", "Allow negative stock"],
              ["trackInventoryByBatch", "Track inventory by batch"],
              ["enableExpiryTracking", "Enable expiry tracking"],
              ["requireCustomerOnSale", "Require customer on sale"],
              ["requireSupplierOnPurchase", "Require supplier on purchase"],
              ["allowBackdatedTransactions", "Allow backdated transactions"],
              ["autoPostJournals", "Auto-post journals"],
            ] as const
          ).map(([key, label]) => (
            <label key={key} className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={flags[key]}
                onChange={(e) =>
                  setFlags((f) => ({ ...f, [key]: e.target.checked }))
                }
              />
              {label}
            </label>
          ))}
        </div>
        <Button
          type="button"
          variant="outline"
          disabled={pending}
          onClick={() =>
            start(async () => {
              const r = await updateBusinessSettingsAction(flags);
              if (!r.success) toast.error(r.message);
              else {
                toast.success(r.message);
                router.refresh();
              }
            })
          }
        >
          Save operational settings
        </Button>
      </section>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1">
      <Label>{label}</Label>
      {children}
    </div>
  );
}
