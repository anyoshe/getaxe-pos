"use client";

import type { UseFormReturn } from "react-hook-form";
import { FormSection, FormSearchableSelect } from "@/components/forms";
import type { ProductContext } from "../../../types";
import type { ProductFormInput } from "../product-form.types";
import {
  ProductPackagingEditor,
  type PackagingLineDraft,
} from "./product-packaging-editor";

interface ProductUnitsProps {
  form: UseFormReturn<ProductFormInput>;
  context: ProductContext;
  visibleFields?: string[];
  requiredFields?: string[];
  productId?: string | null;
  packagingDraft?: PackagingLineDraft[];
  onPackagingDraftChange?: (lines: PackagingLineDraft[]) => void;
}

export function ProductUnits({
  form,
  context,
  visibleFields,
  requiredFields,
  productId,
  packagingDraft = [],
  onPackagingDraftChange,
}: ProductUnitsProps) {
  const visibleSet = new Set(visibleFields ?? []);
  const requiredSet = new Set(requiredFields ?? []);
  const isRequired = (field: string) => requiredSet.has(field);
  const showField = (field: string) =>
    visibleFields === undefined || visibleSet.has(field);

  return (
    <FormSection
      title="Units of Measure"
      description="Optional units for buying, selling, and warehouse quantity. Add packaging factors (strip/box) below — works on create and edit."
    >
      <div className="grid gap-4 md:grid-cols-3">
        {showField("purchaseUnitId") && (
          <FormSearchableSelect
            control={form.control}
            name="purchaseUnitId"
            options={context.units}
            label="Purchase unit"
            placeholder="Select purchase unit"
            required={isRequired("purchaseUnitId")}
            description="Unit used when buying from suppliers"
          />
        )}
        {showField("salesUnitId") && (
          <FormSearchableSelect
            control={form.control}
            name="salesUnitId"
            options={context.units}
            label="Sales unit"
            placeholder="Select sales unit"
            required={isRequired("salesUnitId")}
            description="Unit used at the counter / invoice"
          />
        )}
        {showField("stockUnitId") && (
          <FormSearchableSelect
            control={form.control}
            name="stockUnitId"
            options={context.units}
            label="Stock unit"
            placeholder="Select stock unit"
            required={isRequired("stockUnitId")}
            description="Canonical warehouse unit (factor 1)"
          />
        )}
      </div>
      <ProductPackagingEditor
        productId={productId}
        units={context.units.map((u) => ({
          id: u.id,
          name: u.name,
          code: (u as { code?: string | null }).code ?? null,
        }))}
        draftLines={packagingDraft}
        onDraftChange={onPackagingDraftChange}
      />
    </FormSection>
  );
}
