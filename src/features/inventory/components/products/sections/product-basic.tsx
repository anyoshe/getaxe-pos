"use client";

import { useState } from "react";
import type { UseFormReturn } from "react-hook-form";
import {
  FormSection,
  FormTextField,
  FormNumberField,
  FormTextarea,
} from "@/components/forms";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import type { ProductFormInput } from "../product-form.types";
import { lookupProductCodeAction } from "../../../actions";
import { BarcodeScanner } from "../entry/barcode-scanner";

interface ProductBasicProps {
  form: UseFormReturn<ProductFormInput>;
  visibleFields?: string[];
  requiredFields?: string[];
}

export function ProductBasic({
  form,
  visibleFields,
  requiredFields,
}: ProductBasicProps) {
  const visibleSet = new Set(visibleFields ?? []);
  const requiredSet = new Set(requiredFields ?? []);
  const isRequired = (field: string) => requiredSet.has(field);
  const showField = (field: string) =>
    visibleFields === undefined || visibleSet.has(field);
  const [showScanner, setShowScanner] = useState(false);

  async function applyScannedCode(code: string) {
    form.setValue("barcode", code, { shouldDirty: true, shouldValidate: true });
    const result = await lookupProductCodeAction(code);
    if (result.product) {
      toast.message(`Code matches existing product: ${result.product.name}`);
    } else {
      toast.success("Barcode applied — new product code.");
    }
    setShowScanner(false);
  }

  return (
    <FormSection
      title="Basic Information"
      description="Core identity for this product. Fields marked * are required for the selected product type and capabilities."
    >
      <div className="grid gap-4 md:grid-cols-2">
        {showField("name") && (
          <FormTextField
            form={form}
            name="name"
            label="Product Name"
            required={isRequired("name") || true}
            placeholder="e.g. Paracetamol 500mg tablets"
            description="Display name used on invoices and stock lists"
          />
        )}
        {showField("genericName") && (
          <FormTextField
            form={form}
            name="genericName"
            label="Generic Name"
            required={isRequired("genericName")}
            placeholder="e.g. Paracetamol"
          />
        )}
        {showField("productBrand") && (
          <FormTextField
            form={form}
            name="productBrand"
            label="Brand"
            required={isRequired("productBrand")}
            placeholder="e.g. Panadol"
          />
        )}
        {showField("sku") && (
          <FormTextField
            form={form}
            name="sku"
            label="SKU / Part number"
            required={isRequired("sku")}
            placeholder="Internal code"
            description="Optional stock-keeping unit or part number"
          />
        )}
        {showField("barcode") && (
          <div className="space-y-2">
            <FormTextField
              form={form}
              name="barcode"
              label="Barcode"
              required={isRequired("barcode")}
              placeholder="Scan or type barcode"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowScanner((v) => !v)}
            >
              {showScanner ? "Hide scanner" : "Scan barcode / QR"}
            </Button>
          </div>
        )}
        {showField("packSize") && (
          <FormTextField
            form={form}
            name="packSize"
            label="Pack Size"
            required={isRequired("packSize")}
            placeholder="e.g. 20 tablets"
          />
        )}
        {showField("costPrice") && (
          <FormNumberField
            form={form}
            name="costPrice"
            label="Cost Price"
            step="0.01"
            required={isRequired("costPrice")}
            placeholder="0.00"
          />
        )}
      </div>
      {showScanner && (
        <div className="mt-4">
          <BarcodeScanner
            onScan={(code) => void applyScannedCode(code)}
            onClose={() => setShowScanner(false)}
          />
        </div>
      )}
      {showField("description") && (
        <FormTextarea
          form={form}
          name="description"
          label="Description"
          required={isRequired("description")}
          rows={3}
          placeholder="Optional notes for staff"
        />
      )}
    </FormSection>
  );
}
