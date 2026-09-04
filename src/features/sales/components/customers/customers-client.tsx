"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { createCustomerAction } from "../../actions/create-customer";

export type CustomerRow = {
  id: string;
  customerNumber: string | null;
  firstName: string;
  lastName: string | null;
  companyName: string | null;
  phone: string | null;
  email: string | null;
  idNumber?: string | null;
  allowCredit?: boolean | null;
  creditLimit?: string | number | null;
  loyaltyPoints?: number | null;
};

const empty = {
  customerType: "INDIVIDUAL" as "INDIVIDUAL" | "BUSINESS",
  firstName: "",
  lastName: "",
  companyName: "",
  tradingName: "",
  registrationNumber: "",
  businessNature: "",
  contactPersonTitle: "",
  phone: "",
  email: "",
  idType: "NATIONAL_ID",
  idNumber: "",
  taxPin: "",
  dateOfBirth: "",
  gender: "" as "" | "MALE" | "FEMALE" | "OTHER",
  address: "",
  city: "",
  county: "",
  postalCode: "",
  occupation: "",
  employer: "",
  emergencyContact: "",
  emergencyPhone: "",
  allowCredit: false,
  creditLimit: "",
  creditTermsDays: "30",
  creditNotes: "",
};

export function CustomersClient({ customers }: { customers: CustomerRow[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [form, setForm] = useState(empty);
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return customers;
    return customers.filter((c) =>
      [c.firstName, c.lastName, c.companyName, c.phone, c.customerNumber, c.idNumber]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(s),
    );
  }, [customers, q]);

  function set<K extends keyof typeof empty>(key: K, value: (typeof empty)[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const result = await createCustomerAction({
        ...form,
        lastName: form.lastName || null,
        companyName: form.companyName || null,
        tradingName: form.tradingName || null,
        registrationNumber: form.registrationNumber || null,
        businessNature: form.businessNature || null,
        contactPersonTitle: form.contactPersonTitle || null,
        email: form.email || null,
        idType: form.idType || null,
        idNumber: form.idNumber || null,
        taxPin: form.taxPin || null,
        dateOfBirth: form.dateOfBirth || null,
        gender: form.gender || null,
        address: form.address || null,
        city: form.city || null,
        county: form.county || null,
        postalCode: form.postalCode || null,
        occupation: form.occupation || null,
        employer: form.employer || null,
        emergencyContact: form.emergencyContact || null,
        emergencyPhone: form.emergencyPhone || null,
        creditLimit: form.creditLimit ? Number(form.creditLimit) : 0,
        creditTermsDays: form.creditTermsDays ? Number(form.creditTermsDays) : 30,
        creditNotes: form.creditNotes || null,
      });
      if (result.success) {
        toast.success(result.message);
        setForm({ ...empty });
        router.refresh();
      } else {
        toast.error(result.message);
      }
    });
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Customers</h1>
        <p className="text-sm text-muted-foreground">
          Individuals and other businesses (B2B). Enable credit for on-account
          sales — personal KYC for people, company registration + PIN for
          businesses you lend to.
        </p>
      </div>

      <form onSubmit={onSubmit} className="space-y-6 rounded-xl border bg-card p-4 shadow-sm sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-sm font-semibold">New customer (KYC)</h2>
          <div className="flex gap-2">
            {(["INDIVIDUAL", "BUSINESS"] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => set("customerType", t)}
                className={
                  form.customerType === t
                    ? "rounded-lg border-2 border-primary bg-primary/10 px-3 py-1.5 text-xs font-bold text-primary"
                    : "rounded-lg border px-3 py-1.5 text-xs text-muted-foreground"
                }
              >
                {t === "INDIVIDUAL" ? "Individual (person)" : "Business (B2B)"}
              </button>
            ))}
          </div>
        </div>

        <section className="space-y-3">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">1. Identity</h3>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <div className="space-y-1">
              <Label>
                {form.customerType === "BUSINESS"
                  ? "Authorized contact first name *"
                  : "First / given name *"}
              </Label>
              <Input required value={form.firstName ?? ""} onChange={(e) => set("firstName", e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label>
                {form.customerType === "BUSINESS"
                  ? "Contact surname"
                  : "Last / surname"}
              </Label>
              <Input value={form.lastName ?? ""} onChange={(e) => set("lastName", e.target.value)} />
            </div>
            {form.customerType === "BUSINESS" ? (
              <>
                <div className="space-y-1 sm:col-span-2">
                  <Label>Legal company / business name *</Label>
                  <Input
                    value={form.companyName ?? ""}
                    onChange={(e) => set("companyName", e.target.value)}
                    placeholder="As on registration certificate"
                  />
                </div>
                <div className="space-y-1">
                  <Label>Trading name (if different)</Label>
                  <Input
                    value={form.tradingName ?? ""}
                    onChange={(e) => set("tradingName", e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <Label>
                    Registration / incorporation no.
                    {form.allowCredit ? " *" : ""}
                  </Label>
                  <Input
                    value={form.registrationNumber ?? ""}
                    onChange={(e) => set("registrationNumber", e.target.value)}
                    placeholder="e.g. PVT-XXXX / BN-XXXX"
                  />
                </div>
                <div className="space-y-1">
                  <Label>
                    Business KRA PIN
                    {form.allowCredit ? " *" : ""}
                  </Label>
                  <Input
                    value={form.taxPin ?? ""}
                    onChange={(e) => set("taxPin", e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <Label>Nature of business</Label>
                  <Input
                    value={form.businessNature ?? ""}
                    onChange={(e) => set("businessNature", e.target.value)}
                    placeholder="e.g. Pharmacy, wholesale hardware"
                  />
                </div>
                <div className="space-y-1">
                  <Label>Contact person title</Label>
                  <Input
                    value={form.contactPersonTitle ?? ""}
                    onChange={(e) => set("contactPersonTitle", e.target.value)}
                    placeholder="e.g. Procurement, Director"
                  />
                </div>
              </>
            ) : null}
            <div className="space-y-1">
              <Label>ID type</Label>
              <select
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm"
                value={form.idType ?? ""}
                onChange={(e) => set("idType", e.target.value)}
              >
                <option value="NATIONAL_ID">National ID</option>
                <option value="PASSPORT">Passport</option>
                <option value="ALIEN_ID">Alien ID</option>
                <option value="OTHER">Other</option>
              </select>
            </div>
            <div className="space-y-1">
              <Label>ID / passport number{form.allowCredit ? " *" : ""}</Label>
              <Input value={form.idNumber ?? ""} onChange={(e) => set("idNumber", e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label>KRA PIN</Label>
              <Input value={form.taxPin ?? ""} onChange={(e) => set("taxPin", e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label>Date of birth</Label>
              <Input type="date" value={form.dateOfBirth ?? ""} onChange={(e) => set("dateOfBirth", e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label>Gender</Label>
              <select
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm"
                value={form.gender ?? ""}
                onChange={(e) => set("gender", e.target.value as typeof form.gender)}
              >
                <option value="">—</option>
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
                <option value="OTHER">Other</option>
              </select>
            </div>
            <div className="space-y-1">
              <Label>Occupation</Label>
              <Input value={form.occupation ?? ""} onChange={(e) => set("occupation", e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label>Employer</Label>
              <Input value={form.employer ?? ""} onChange={(e) => set("employer", e.target.value)} />
            </div>
          </div>
        </section>

        <section className="space-y-3">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">2. Contact & address</h3>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <div className="space-y-1">
              <Label>Mobile phone *</Label>
              <Input required value={form.phone ?? ""} onChange={(e) => set("phone", e.target.value)} placeholder="07…" />
            </div>
            <div className="space-y-1">
              <Label>Email</Label>
              <Input type="email" value={form.email ?? ""} onChange={(e) => set("email", e.target.value)} />
            </div>
            <div className="space-y-1 sm:col-span-2">
              <Label>Physical address{form.allowCredit ? " *" : ""}</Label>
              <Input value={form.address ?? ""} onChange={(e) => set("address", e.target.value)} placeholder="Street, building, estate" />
            </div>
            <div className="space-y-1">
              <Label>City / town</Label>
              <Input value={form.city ?? ""} onChange={(e) => set("city", e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label>County</Label>
              <Input value={form.county ?? ""} onChange={(e) => set("county", e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label>Postal code</Label>
              <Input value={form.postalCode ?? ""} onChange={(e) => set("postalCode", e.target.value)} />
            </div>
          </div>
        </section>

        <section className="space-y-3">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            3. Next of kin{form.allowCredit ? " (required for credit)" : ""}
          </h3>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <Label>Next of kin full name</Label>
              <Input value={form.emergencyContact ?? ""} onChange={(e) => set("emergencyContact", e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label>Next of kin phone</Label>
              <Input value={form.emergencyPhone ?? ""} onChange={(e) => set("emergencyPhone", e.target.value)} />
            </div>
          </div>
        </section>

        <section className="space-y-3 rounded-lg border border-primary/20 bg-primary/5 p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-primary">4. Credit account</h3>
            <label className="flex items-center gap-2 text-sm font-medium">
              <input
                type="checkbox"
                className="size-4 rounded border"
                checked={form.allowCredit}
                onChange={(e) => set("allowCredit", e.target.checked)}
              />
              Enable credit / on-account sales
            </label>
          </div>
          {form.allowCredit ? (
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="space-y-1">
                <Label>Credit limit (KES) *</Label>
                <Input type="number" min={0} step="0.01" value={form.creditLimit ?? ""} onChange={(e) => set("creditLimit", e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label>Payment terms (days)</Label>
                <Input type="number" min={0} value={form.creditTermsDays ?? ""} onChange={(e) => set("creditTermsDays", e.target.value)} />
              </div>
              <div className="space-y-1 sm:col-span-3">
                <Label>Credit notes / conditions</Label>
                <Input value={form.creditNotes ?? ""} onChange={(e) => set("creditNotes", e.target.value)} placeholder="e.g. Net 30" />
              </div>
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">
              Leave off for cash customers. Turn on to lend on account to a
              person or another business (B2B) from POS credit invoices.
            </p>
          )}
        </section>

        <Button type="submit" disabled={pending}>
          {pending ? "Saving…" : form.allowCredit ? "Save credit customer" : "Save customer"}
        </Button>
      </form>

      <div className="flex flex-wrap items-center gap-3">
        <Input className="max-w-sm" placeholder="Search name, phone, ID…" value={q} onChange={(e) => setQ(e.target.value)} />
        <span className="text-xs text-muted-foreground">{filtered.length} customers</span>
      </div>

      <div className="overflow-x-auto rounded-xl border">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-left">
            <tr>
              <th className="p-3">Name</th>
              <th className="p-3">Phone</th>
              <th className="p-3">ID</th>
              <th className="p-3">Credit</th>
              <th className="p-3">Limit</th>
              <th className="p-3">#</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-6 text-center text-muted-foreground">No customers yet.</td>
              </tr>
            ) : (
              filtered.map((c) => (
                <tr key={c.id} className="border-t">
                  <td className="p-3 font-medium">
                    {[c.firstName, c.lastName].filter(Boolean).join(" ")}
                    {c.companyName ? (
                      <span className="block text-xs text-muted-foreground">
                        {c.companyName}
                        <span className="text-primary"> · Business</span>
                      </span>
                    ) : null}
                  </td>
                  <td className="p-3 text-muted-foreground">{c.phone ?? "—"}</td>
                  <td className="p-3 font-mono text-xs">{c.idNumber ?? "—"}</td>
                  <td className="p-3">
                    {c.allowCredit ? (
                      <span className="rounded-full bg-primary/15 px-2 py-0.5 text-xs font-medium text-primary">Credit</span>
                    ) : (
                      <span className="text-xs text-muted-foreground">Cash</span>
                    )}
                  </td>
                  <td className="p-3 tabular-nums">
                    {c.allowCredit ? Number(c.creditLimit ?? 0).toLocaleString() : "—"}
                  </td>
                  <td className="p-3 text-muted-foreground">{c.customerNumber ?? "—"}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
