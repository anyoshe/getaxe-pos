"use client";

import { useState, useTransition } from "react";
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

type Row = { id: string; name: string; code?: string };

export function PharmacyCataloguesClient({
  dosageForms,
  drugCategories,
  drugStrengths,
  prescriptionTypes,
}: {
  dosageForms: Row[];
  drugCategories: Row[];
  drugStrengths: Row[];
  prescriptionTypes: Row[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

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

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-primary">
          Pharmacy setup
        </p>
        <h1 className="text-2xl font-semibold tracking-tight">
          Pharmacy catalogues
        </h1>
        <p className="text-sm text-muted-foreground">
          Populate these lists so medicine products can select dosage form, drug
          category, strength, and prescription type in the product wizard.
          Full prescriptions and dispensation come later in the Pharmacy module.
        </p>
        <div className="mt-3">
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
            {pending ? "Seeding…" : "Load default pharmacy catalogues"}
          </Button>
          <p className="mt-1 text-xs text-muted-foreground">
            Adds standard dosage forms, therapeutic categories, strengths, and
            OTC/POM types if missing. Safe to run more than once.
          </p>
        </div>
      </div>

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
