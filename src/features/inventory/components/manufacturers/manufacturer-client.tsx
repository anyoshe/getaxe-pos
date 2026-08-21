"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { createManufacturerAction } from "@/features/pharmacy/actions/reference-data";

type Manufacturer = { id: string; name: string; businessId: string | null };

export function ManufacturerClient({
  manufacturers,
}: {
  manufacturers: Manufacturer[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [name, setName] = useState("");
  const [country, setCountry] = useState("");

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const result = await createManufacturerAction({
        name,
        country: country || null,
      });
      if (!result.success) {
        toast.error(result.message);
        return;
      }
      toast.success(result.message);
      setName("");
      setCountry("");
      router.refresh();
    });
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-primary">
          Inventory
        </p>
        <h1 className="text-2xl font-semibold tracking-tight">Manufacturers</h1>
        <p className="text-sm text-muted-foreground">
          Used on the product wizard Classification step (hardware, medicine,
          etc.).
        </p>
      </div>

      <form
        onSubmit={onSubmit}
        className="space-y-3 rounded-xl border border-border/60 bg-card/50 p-4"
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label>
              Name <span className="text-destructive">*</span>
            </Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Pfizer, Bosch"
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label>Country</Label>
            <Input
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              placeholder="Optional"
            />
          </div>
        </div>
        <Button type="submit" disabled={pending || !name.trim()}>
          {pending ? "Saving…" : "Add manufacturer"}
        </Button>
      </form>

      <div className="overflow-x-auto rounded-xl border">
        <table className="w-full text-sm">
          <thead className="bg-secondary/50 text-left">
            <tr>
              <th className="p-3 font-medium">Name</th>
              <th className="p-3 font-medium">Scope</th>
            </tr>
          </thead>
          <tbody>
            {manufacturers.length === 0 ? (
              <tr>
                <td colSpan={2} className="p-6 text-center text-muted-foreground">
                  No manufacturers yet. Add one above.
                </td>
              </tr>
            ) : (
              manufacturers.map((m) => (
                <tr key={m.id} className="border-t">
                  <td className="p-3 font-medium">{m.name}</td>
                  <td className="p-3 text-muted-foreground">
                    {m.businessId ? "This business" : "Global"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
