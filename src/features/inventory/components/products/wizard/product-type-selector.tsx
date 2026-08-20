"use client";

import type { ProductType } from "../../../types/products";
import { productRuleResolver } from "../../../services/product-rule-resolver";

interface ProductTypeSelectorProps {
  value: ProductType | null;
  businessCapabilities?: string[];
  onSelect: (type: ProductType) => void;
}

const PRODUCT_TYPE_META: Record<
  ProductType,
  { title: string; description: string; icon: string }
> = {
  physical: {
    title: "Physical / hardware",
    description:
      "Stocked goods, spares, hardware. Steps depend on stock, batch, serial, and reorder capabilities.",
    icon: "📦",
  },
  service: {
    title: "Service",
    description:
      "Non-stock services. No inventory steps — focus on name, category, and pricing.",
    icon: "🛠️",
  },
  medicine: {
    title: "Medicine",
    description:
      "Pharmacy items. Batch, expiry, and drug classification when those capabilities are enabled.",
    icon: "💊",
  },
  "raw-material": {
    title: "Raw material",
    description:
      "Inputs for production. Inventory and unit steps when stock is tracked.",
    icon: "🏭",
  },
  "finished-product": {
    title: "Finished product",
    description:
      "Manufactured goods ready for sale, with optional serialisation.",
    icon: "📦",
  },
};

export function ProductTypeSelector({
  value,
  businessCapabilities = [],
  onSelect,
}: ProductTypeSelectorProps) {
  const types = productRuleResolver.availableProductTypes(
    businessCapabilities,
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">What kind of product?</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          This chooses the wizard steps. Medicine is only listed when pharmacy
          capabilities are enabled.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {types.map((typeId) => {
          const meta = PRODUCT_TYPE_META[typeId];
          const selected = value === typeId;
          return (
            <button
              key={typeId}
              type="button"
              onClick={() => onSelect(typeId)}
              className={[
                "flex flex-col items-start gap-2 rounded-lg border p-4 text-left transition-colors",
                selected
                  ? "border-primary bg-primary/5 ring-2 ring-primary"
                  : "border-border hover:border-primary/50 hover:bg-muted/40",
              ].join(" ")}
            >
              <span className="text-2xl" aria-hidden>
                {meta.icon}
              </span>
              <span className="font-medium">{meta.title}</span>
              <span className="text-sm text-muted-foreground">
                {meta.description}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
