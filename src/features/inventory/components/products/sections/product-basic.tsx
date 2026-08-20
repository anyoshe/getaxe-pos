"use client";

import { useState } from "react";
import type { UseFormReturn } from "react-hook-form";
import { FormSection, FormTextField, FormNumberField, FormTextarea } from "@/components/forms";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import type { ProductFormInput } from "../product-form.types";
import { lookupProductCodeAction } from "../../../actions";
import { BarcodeScanner } from "../entry/barcode-scanner";

interface ProductBasicProps {
  form: UseFormReturn<ProductFormInput>;
  visibleFields?: string[];
}

export function ProductBasic({ form, visibleFields }: ProductBasicProps) {
  const visibleSet = new Set(visibleFields ?? []);
  const showField = (field: string) => visibleFields === undefined || visibleSet.has(field);
  const [showScanner, setShowScanner] = useState(false);

  async function applyScannedCode(code: string) {
    form.setValue("barcode", code, { shouldDirty: true, shouldValidate: true });
    const result = await lookupProductCodeAction(code);
    if (result.product) toast.message(`Code matches existing product: ${result.product.name}`);
    else toast.success("Barcode applied — new product code.");
    setShowScanner(false);
  }

  return (
    <FormSection title="Basic Information" description="General product information. Scan a barcode to fill and check duplicates.">
      <div className="grid gap-4 md:grid-cols-2">
        {showField("name") && <FormTextField form={form} name="name" label="Product Name" />}
        {showField("genericName") && <FormTextField form={form} name="genericName" label="Generic Name" />}
        {showField("productBrand") && <FormTextField form={form} name="productBrand" label="Brand" />}
        {showField("sku") && <FormTextField form={form} name="sku" label="SKU" />}
        {showField("barcode") && (
          <div className="space-y-2">
            <FormTextField form={form} name="barcode" label="Barcode" />
            <Button type="button" variant="outline" size="sm" onClick={() => setShowScanner((v) => !v)}>
              {showScanner ? "Hide scanner" : "Scan barcode / QR"}
            </Button>
          </div>
        )}
        {showField("packSize") && <FormTextField form={form} name="packSize" label="Pack Size" />}
        {showField("costPrice") && <FormNumberField form={form} name="costPrice" label="Cost Price" step="0.01" />}
      </div>
      {showScanner && (
        <div className="mt-4">
          <BarcodeScanner onScan={(code) => void applyScannedCode(code)} onClose={() => setShowScanner(false)} />
        </div>
      )}
      {showField("description") && <FormTextarea form={form} name="description" label="Description" rows={4} />}
    </FormSection>
  );
}
