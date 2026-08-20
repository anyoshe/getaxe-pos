"use client";

import { Button } from "@/components/ui/button";

export type ProductEntryMethod = "manual" | "scan";

interface EntryMethodSelectorProps {
  value: ProductEntryMethod | null;
  onSelect: (method: ProductEntryMethod) => void;
}

const METHODS: Array<{
  id: ProductEntryMethod;
  title: string;
  description: string;
  icon: string;
}> = [
  {
    id: "manual",
    title: "Manual entry",
    description:
      "Step through a form tailored to the product type and your enabled capabilities.",
    icon: "✍️",
  },
  {
    id: "scan",
    title: "Scan to prefill",
    description:
      "Scan barcode/QR (or type a code), then complete only the fields you need. Add many without restarting.",
    icon: "📷",
  },
];

export function EntryMethodSelector({
  value,
  onSelect,
}: EntryMethodSelectorProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">How do you want to add products?</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Choose once. You can add multiple products of the same type without
          returning here.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {METHODS.map((method) => {
          const selected = value === method.id;
          return (
            <button
              key={method.id}
              type="button"
              onClick={() => onSelect(method.id)}
              className={[
                "flex flex-col items-start gap-2 rounded-lg border p-4 text-left transition-colors",
                selected
                  ? "border-primary bg-primary/5 ring-2 ring-primary"
                  : "border-border hover:border-primary/50 hover:bg-muted/40",
              ].join(" ")}
            >
              <span className="text-2xl" aria-hidden>
                {method.icon}
              </span>
              <span className="font-medium">{method.title}</span>
              <span className="text-sm text-muted-foreground">
                {method.description}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
