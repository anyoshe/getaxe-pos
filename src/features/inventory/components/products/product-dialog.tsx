"use client";

import { useEffect, useState } from "react";
import { CrudDialog } from "@/components/crud";
import { Button } from "@/components/ui/button";
import { ProductForm } from "./product-form";
import { BatchProductEntry, QuickScanEntry } from "./entry";
import type { Product, ProductContext } from "../../types";
import type { ProductFormInput } from "./product-form.types";

export type ProductEntryMode = "wizard" | "quick" | "batch";

interface ProductDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product?: Product | null;
  context: ProductContext;
  onSuccess: () => void;
  initialMode?: ProductEntryMode;
}

export function ProductDialog({
  open, onOpenChange, product, context, onSuccess, initialMode = "wizard",
}: ProductDialogProps) {
  const isEdit = Boolean(product);
  const [mode, setMode] = useState<ProductEntryMode>(isEdit ? "wizard" : initialMode);
  const [wizardPrefill, setWizardPrefill] = useState<Partial<ProductFormInput> | null>(null);

  useEffect(() => {
    if (open) {
      setMode(isEdit ? "wizard" : initialMode);
      setWizardPrefill(null);
    }
  }, [open, initialMode, isEdit]);

  const title = isEdit ? "Edit Product" : mode === "quick" ? "Quick scan product" : mode === "batch" ? "Batch add products" : "New Product";
  const description = isEdit
    ? "Update product information."
    : mode === "quick"
      ? "Scan a barcode or QR, check the catalog, then save."
      : mode === "batch"
        ? "Add multiple products, optionally by scanning, then save all."
        : "Create a product with the capability-driven wizard.";

  function handleSuccess() { onOpenChange(false); onSuccess(); }

  return (
    <CrudDialog open={open} onOpenChange={onOpenChange} title={title} description={description}>
      {!isEdit && (
        <div className="mb-4 flex flex-wrap gap-2">
          <Button type="button" size="sm" variant={mode === "wizard" ? "default" : "outline"} onClick={() => setMode("wizard")}>Full wizard</Button>
          <Button type="button" size="sm" variant={mode === "quick" ? "default" : "outline"} onClick={() => setMode("quick")}>Quick scan</Button>
          <Button type="button" size="sm" variant={mode === "batch" ? "default" : "outline"} onClick={() => setMode("batch")}>Batch entry</Button>
        </div>
      )}
      {mode === "wizard" && (
        <ProductForm product={product} context={context} prefill={wizardPrefill} onSuccess={handleSuccess} />
      )}
      {mode === "quick" && !isEdit && (
        <QuickScanEntry context={context} onSuccess={handleSuccess} onSwitchToWizard={(prefill) => { setWizardPrefill(prefill); setMode("wizard"); }} />
      )}
      {mode === "batch" && !isEdit && (
        <BatchProductEntry context={context} onSuccess={handleSuccess} />
      )}
    </CrudDialog>
  );
}
