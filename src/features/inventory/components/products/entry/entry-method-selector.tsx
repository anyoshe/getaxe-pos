"use client";

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
        <p className="text-xs font-semibold uppercase tracking-wide text-primary">
          Add products
        </p>
        <h2 className="text-xl font-semibold tracking-tight">
          How do you want to add products?
        </h2>
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
                "flex flex-col items-start gap-2 rounded-2xl border p-5 text-left transition-all",
                selected
                  ? "border-primary bg-primary/5 shadow-md ring-2 ring-primary/30"
                  : "border-border bg-card hover:border-primary/40 hover:bg-secondary/40",
              ].join(" ")}
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-secondary text-xl">
                {method.icon}
              </span>
              <span className="font-semibold text-foreground">
                {method.title}
              </span>
              <span className="text-sm leading-relaxed text-muted-foreground">
                {method.description}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
