"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { FormSection, FormTextField, FormNumberField, FormSearchableSelect } from "@/components/forms";
import type { ProductContext, ProductType } from "../../../types";
import { productFormSchema, type ProductFormInput } from "../product-form.types";
import { createProductAction, lookupProductCodeAction } from "../../../actions";
import { BarcodeScanner } from "./barcode-scanner";

interface QuickScanEntryProps {
  context: ProductContext;
  onSuccess: () => void;
  onSwitchToWizard?: (prefill: Partial<ProductFormInput>) => void;
}

const DEFAULTS: ProductFormInput = {
  productType: "physical", categoryId: "", supplierId: null, manufacturerId: null,
  drugCategoryId: null, dosageFormId: null, drugStrengthId: null, prescriptionTypeId: null,
  purchaseUnitId: null, salesUnitId: null, stockUnitId: null, incomeAccountId: null,
  expenseAccountId: null, inventoryAccountId: null, taxRateId: null, name: "",
  genericName: null, productBrand: null, description: null, sku: null, barcode: null,
  packSize: null, costPrice: null,
  sellingPrice: null, minimumStock: 0, reorderLevel: 0, trackInventory: true,
  trackBatch: false, trackExpiry: false, serialized: false, allowNegativeStock: false, active: true,
};

export function QuickScanEntry({ context, onSuccess, onSwitchToWizard }: QuickScanEntryProps) {
  const [phase, setPhase] = useState<"scan" | "review">("scan");
  const [pending, startTransition] = useTransition();
  const [lookupMessage, setLookupMessage] = useState<string | null>(null);
  const [exists, setExists] = useState(false);
  const form = useForm<ProductFormInput>({ resolver: zodResolver(productFormSchema), defaultValues: DEFAULTS });

  async function handleCode(code: string) {
    setLookupMessage("Looking up…");
    const result = await lookupProductCodeAction(code);
    if (!result.success) { toast.error(result.message); setLookupMessage(null); return; }
    if (result.product) {
      setExists(true);
      setLookupMessage(`Existing product: ${result.product.name} (matched by ${result.matchedBy}).`);
      form.reset({
        ...DEFAULTS,
        productType: (result.product.productType as ProductType) ?? "physical",
        categoryId: result.product.categoryId, name: result.product.name, sku: result.product.sku,
        barcode: result.product.barcode, productBrand: result.product.productBrand,
        costPrice: result.product.costPrice, description: result.product.description,
        trackInventory: result.product.trackInventory, trackBatch: result.product.trackBatch,
        trackExpiry: result.product.trackExpiry, serialized: result.product.serialized,
        minimumStock: result.product.minimumStock ?? 0, reorderLevel: result.product.reorderLevel ?? 0,
        active: result.product.active,
      });
      setPhase("review");
      return;
    }
    setExists(false);
    setLookupMessage("New code — fill in details and save.");
    form.reset({ ...DEFAULTS, barcode: code, productType: "physical", categoryId: context.categories[0]?.id ?? "" });
    setPhase("review");
  }

  function onSave(values: ProductFormInput) {
    if (exists) { toast.message("Product already exists. Use Edit from the list instead."); return; }
    startTransition(async () => {
      const formData = new FormData();
      Object.entries(values).forEach(([key, value]) => {
        if (value === null || value === undefined) return;
        formData.append(key, String(value));
      });
      const result = await createProductAction(formData);
      if (!result.success) { toast.error(result.message ?? "Unable to save product."); return; }
      toast.success(result.message);
      onSuccess();
    });
  }

  if (phase === "scan") {
    return (
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold">Quick scan</h3>
          <p className="text-sm text-muted-foreground">Scan a barcode or QR to check the product and prefill the form.</p>
        </div>
        <BarcodeScanner onScan={(code) => void handleCode(code)} />
      </div>
    );
  }

  return (
    <form className="space-y-6" onSubmit={form.handleSubmit(onSave)}>
      {lookupMessage && (
        <p className={exists ? "rounded-md border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-sm" : "rounded-md border border-primary/30 bg-primary/5 px-3 py-2 text-sm"}>
          {lookupMessage}
        </p>
      )}
      <FormSection title="Product details" description="Confirm details before saving.">
        <div className="grid gap-4 md:grid-cols-2">
          <FormTextField form={form} name="name" label="Product Name" />
          <FormTextField form={form} name="barcode" label="Barcode" />
          <FormTextField form={form} name="sku" label="SKU" />
          <FormTextField form={form} name="productBrand" label="Brand" />
          <FormNumberField form={form} name="costPrice" label="Cost Price" step="0.01" />
          <FormNumberField form={form} name="sellingPrice" label="Selling Price (optional)" step="0.01" />
          <FormSearchableSelect control={form.control} name="categoryId" options={context.categories} placeholder="Category" />
        </div>
      </FormSection>
      <div className="flex flex-wrap items-center justify-between gap-2 border-t pt-4">
        <Button type="button" variant="outline" onClick={() => { setPhase("scan"); setExists(false); setLookupMessage(null); }}>Scan again</Button>
        <div className="flex gap-2">
          {onSwitchToWizard && (
            <Button type="button" variant="outline" onClick={() => onSwitchToWizard(form.getValues())}>Full wizard</Button>
          )}
          <Button type="submit" disabled={pending || exists}>
            {pending ? "Saving…" : exists ? "Already exists" : "Save product"}
          </Button>
        </div>
      </div>
    </form>
  );
}
