"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import {
  createDosageFormAction,
  createDrugCategoryAction,
  createDrugStrengthAction,
  createPrescriptionTypeAction,
} from "@/features/pharmacy/actions/reference-data";
import { seedDefaultPharmacyCataloguesAction } from "@/features/pharmacy/actions/seed-default-catalogues";
import { ensurePharmacyCapabilitiesAction } from "@/features/capabilities/actions/ensure-pharmacy-capabilities";
import {
  addPharmacyStarterProductsAction,
  addProgrammeTbHivProductsAction,
} from "@/features/pharmacy/actions/pharmacy-starter-products";

type Row = { id: string; name: string; code?: string };

export type StarterProductRow = {
  code: string;
  name: string;
  genericName: string;
  sku: string;
  categoryName: string;
  dosageFormCode: string;
  drugCategoryCode: string;
  strengthLabel: string;
  prescriptionTypeCode: string;
  suggestedCost: number | null;
  suggestedSell: number | null;
  packSize: string | null;
  alreadyInCatalogue: boolean;
};

export function PharmacyCataloguesClient({
  dosageForms,
  drugCategories,
  drugStrengths,
  prescriptionTypes,
  starterProducts = [],
  programmeProducts = [],
}: {
  dosageForms: Row[];
  drugCategories: Row[];
  drugStrengths: Row[];
  prescriptionTypes: Row[];
  starterProducts?: StarterProductRow[];
  programmeProducts?: StarterProductRow[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [selected, setSelected] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {};
    for (const p of starterProducts) {
      if (!p.alreadyInCatalogue) init[p.code] = true;
    }
    return init;
  });
  const [progSelected, setProgSelected] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {};
    for (const p of programmeProducts) {
      if (!p.alreadyInCatalogue) init[p.code] = true;
    }
    return init;
  });

  const selectedCodes = useMemo(
    () => Object.entries(selected).filter(([, v]) => v).map(([k]) => k),
    [selected],
  );
  const progSelectedCodes = useMemo(
    () => Object.entries(progSelected).filter(([, v]) => v).map(([k]) => k),
    [progSelected],
  );

  const missingCount = starterProducts.filter((p) => !p.alreadyInCatalogue).length;
  const progMissingCount = programmeProducts.filter((p) => !p.alreadyInCatalogue).length;

  function makeAdd(
    action: (input: unknown) => Promise<{ success: boolean; message: string }>,
    payload: Record<string, string>,
  ) {
    startTransition(async () => {
      const result = await action(payload);
      if (!result.success) {
        toast.error(result.message);
        return;
      }
      toast.success(result.message);
      router.refresh();
    });
  }

  function toggleAllMissing(on: boolean) {
    const next: Record<string, boolean> = { ...selected };
    for (const p of starterProducts) {
      if (!p.alreadyInCatalogue) next[p.code] = on;
    }
    setSelected(next);
  }

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-primary">
          Pharmacy setup
        </p>
        <h1 className="text-2xl font-semibold tracking-tight">
          Pharmacy catalogues
        </h1>
        <p className="text-sm text-muted-foreground">
          Populate lookup lists for the product wizard, then add starter medicine
          products (masters only — no stock). Receive opening stock or GRN for
          what you actually hold.
        </p>
        <div className="mt-3">
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              disabled={pending}
              onClick={() => {
                startTransition(async () => {
                  const result = await ensurePharmacyCapabilitiesAction();
                  if (!result.success) {
                    toast.error(result.message);
                    return;
                  }
                  toast.success(result.message);
                  router.refresh();
                });
              }}
            >
              Enable pharmacy features
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled={pending}
              onClick={() => {
                startTransition(async () => {
                  const result = await seedDefaultPharmacyCataloguesAction();
                  if (!result.success) {
                    toast.error(result.message);
                    return;
                  }
                  toast.success(result.message);
                  router.refresh();
                });
              }}
            >
              {pending ? "Working…" : "Load default catalogues"}
            </Button>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Adds standard dosage forms, therapeutic categories, strengths, and
            OTC/POM types if missing. Safe to run more than once.
          </p>
        </div>
      </div>

      
      <section className="space-y-3 rounded-xl border border-amber-500/30 bg-amber-500/5 p-4">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <h2 className="text-lg font-semibold">TB / HIV programme pack (optional)</h2>
            <p className="text-sm text-muted-foreground max-w-2xl">
              For linked ART/TB sites only. These products are marked{" "}
              <span className="font-medium text-foreground">programme</span> and are{" "}
              <span className="font-medium text-foreground">hidden from open POS</span>.
              Dispense via pharmacy / prescription — not walk-in retail sale.
              Confirm lines against your current NASCOP / NTLD supply list before use.
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {progMissingCount} of {programmeProducts.length} not yet in your catalogue
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={pending || progMissingCount === 0}
              onClick={() => {
                const next: Record<string, boolean> = { ...progSelected };
                for (const p of programmeProducts) {
                  if (!p.alreadyInCatalogue) next[p.code] = true;
                }
                setProgSelected(next);
              }}
            >
              Select missing
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={pending}
              onClick={() => setProgSelected({})}
            >
              Clear
            </Button>
            <Button
              type="button"
              disabled={pending || progSelectedCodes.length === 0}
              onClick={() => {
                startTransition(async () => {
                  const result = await addProgrammeTbHivProductsAction(
                    progSelectedCodes,
                  );
                  if (!result.success && result.created === 0) {
                    toast.error(result.message);
                    return;
                  }
                  toast.success(result.message);
                  router.refresh();
                });
              }}
            >
              {pending
                ? "Adding…"
                : `Add ${progSelectedCodes.length || ""} programme product(s)`}
            </Button>
          </div>
        </div>

        <div className="overflow-x-auto rounded-lg border bg-card">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="border-b bg-muted/50 text-xs uppercase text-muted-foreground">
              <tr>
                <th className="p-2 w-10">Add</th>
                <th className="p-2">Product</th>
                <th className="p-2">SKU</th>
                <th className="p-2">Form</th>
                <th className="p-2">Category</th>
                <th className="p-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {programmeProducts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-4 text-muted-foreground">
                    No programme templates available.
                  </td>
                </tr>
              ) : (
                programmeProducts.map((p) => (
                  <tr key={p.code} className="border-b last:border-0">
                    <td className="p-2">
                      <input
                        type="checkbox"
                        className="h-4 w-4 accent-primary"
                        disabled={p.alreadyInCatalogue || pending}
                        checked={Boolean(progSelected[p.code])}
                        onChange={(e) =>
                          setProgSelected((prev) => ({
                            ...prev,
                            [p.code]: e.target.checked,
                          }))
                        }
                        aria-label={`Select ${p.name}`}
                      />
                    </td>
                    <td className="p-2">
                      <div className="font-medium text-foreground">{p.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {p.genericName} · {p.strengthLabel}
                      </div>
                    </td>
                    <td className="p-2 font-mono text-xs">{p.sku}</td>
                    <td className="p-2">{p.dosageFormCode}</td>
                    <td className="p-2 text-xs">{p.drugCategoryCode}</td>
                    <td className="p-2">
                      {p.alreadyInCatalogue ? (
                        <span className="text-xs text-emerald-600">In catalogue</span>
                      ) : (
                        <span className="text-xs text-amber-700">Programme only</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

<section className="space-y-3 rounded-xl border border-primary/20 bg-primary/5 p-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="font-semibold text-foreground">
              Starter medicines (product masters)
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Common OTC/POM lines with suggested SKUs. Creates products only —
              quantities stay zero until you receive stock or import opening
              stock. SKUs are unique to your business (not shared serials).
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={pending || missingCount === 0}
              onClick={() => toggleAllMissing(true)}
            >
              Select missing
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={pending}
              onClick={() => toggleAllMissing(false)}
            >
              Clear
            </Button>
            <Button
              type="button"
              size="sm"
              disabled={pending || selectedCodes.length === 0}
              onClick={() => {
                startTransition(async () => {
                  const result = await addPharmacyStarterProductsAction(
                    selectedCodes,
                  );
                  if (!result.success && result.created === 0) {
                    toast.error(result.message);
                    return;
                  }
                  toast.success(result.message);
                  router.refresh();
                });
              }}
            >
              {pending
                ? "Adding…"
                : `Add ${selectedCodes.length || ""} selected to products`}
            </Button>
          </div>
        </div>

        <div className="overflow-x-auto rounded-lg border bg-card">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="border-b bg-muted/50 text-xs uppercase text-muted-foreground">
              <tr>
                <th className="p-2 w-10">Add</th>
                <th className="p-2">Product</th>
                <th className="p-2">SKU</th>
                <th className="p-2">Form</th>
                <th className="p-2">Rx</th>
                <th className="p-2 text-right">Sugg. sell</th>
                <th className="p-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {starterProducts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-4 text-muted-foreground">
                    No starter templates loaded.
                  </td>
                </tr>
              ) : (
                starterProducts.map((p) => (
                  <tr key={p.code} className="border-b last:border-0">
                    <td className="p-2">
                      <input
                        type="checkbox"
                        className="h-4 w-4 accent-primary"
                        disabled={p.alreadyInCatalogue || pending}
                        checked={Boolean(selected[p.code])}
                        onChange={(e) =>
                          setSelected((prev) => ({
                            ...prev,
                            [p.code]: e.target.checked,
                          }))
                        }
                        aria-label={`Select ${p.name}`}
                      />
                    </td>
                    <td className="p-2">
                      <div className="font-medium text-foreground">{p.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {p.genericName}
                        {p.packSize ? ` · ${p.packSize}` : ""}
                      </div>
                    </td>
                    <td className="p-2 font-mono text-xs">{p.sku}</td>
                    <td className="p-2 text-xs">{p.dosageFormCode}</td>
                    <td className="p-2 text-xs">{p.prescriptionTypeCode}</td>
                    <td className="p-2 text-right text-xs">
                      {p.suggestedSell != null
                        ? `KES ${p.suggestedSell}`
                        : "—"}
                    </td>
                    <td className="p-2 text-xs">
                      {p.alreadyInCatalogue ? (
                        <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-emerald-700 dark:text-emerald-400">
                          In catalogue
                        </span>
                      ) : (
                        <span className="text-muted-foreground">Not added</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-muted-foreground">
          Next:{" "}
          <Link
            href="/inventory/stock/receive"
            className="font-medium text-primary underline-offset-2 hover:underline"
          >
            Receive stock
          </Link>{" "}
          or{" "}
          <Link
            href="/inventory/products"
            className="font-medium text-primary underline-offset-2 hover:underline"
          >
            Products
          </Link>{" "}
          → Import opening stock for quantities, batches and expiry.
        </p>
      </section>

      <CatalogueBlock
        title="Dosage forms"
        rows={dosageForms}
        pending={pending}
        onAdd={(code, name) =>
          makeAdd(createDosageFormAction, { code, name })
        }
      />
      <CatalogueBlock
        title="Drug categories"
        rows={drugCategories}
        pending={pending}
        onAdd={(code, name) =>
          makeAdd(createDrugCategoryAction, { code, name })
        }
      />
      <CatalogueBlock
        title="Drug strengths"
        rows={drugStrengths}
        pending={pending}
        onAdd={(code, name) =>
          makeAdd(createDrugStrengthAction, { code, name })
        }
      />
      <CatalogueBlock
        title="Prescription types"
        rows={prescriptionTypes}
        pending={pending}
        onAdd={(code, name) =>
          makeAdd(createPrescriptionTypeAction, {
            code,
            name,
            dispensingLevel: "PRESCRIPTION",
          })
        }
      />
    </div>
  );
}

function CatalogueBlock({
  title,
  rows,
  pending,
  onAdd,
}: {
  title: string;
  rows: Row[];
  pending: boolean;
  onAdd: (code: string, name: string) => void;
}) {
  const [code, setCode] = useState("");
  const [name, setName] = useState("");

  return (
    <section className="space-y-3 rounded-xl border p-4">
      <h2 className="font-semibold">{title}</h2>
      <form
        className="flex flex-wrap items-end gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          onAdd(code, name);
          setCode("");
          setName("");
        }}
      >
        <div className="space-y-1">
          <Label className="text-xs">Code</Label>
          <Input
            className="w-28"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="TAB"
            required
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Name</Label>
          <Input
            className="w-48"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Tablet"
            required
          />
        </div>
        <Button type="submit" size="sm" disabled={pending}>
          Add
        </Button>
      </form>
      <ul className="text-sm text-muted-foreground">
        {rows.length === 0 ? (
          <li>None yet.</li>
        ) : (
          rows.map((r) => (
            <li key={r.id}>
              {r.code ? `${r.code} — ` : ""}
              {r.name}
            </li>
          ))
        )}
      </ul>
    </section>
  );
}
