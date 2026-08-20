"use client";

import { useEffect, useState } from "react";

import { CrudDialog } from "@/components/crud";
import { Button } from "@/components/ui/button";

import { ProductForm } from "./product-form";
import { ProductTypeSelector } from "./wizard/product-type-selector";
import {
  EntryMethodSelector,
  type ProductEntryMethod,
} from "./entry/entry-method-selector";
import { BarcodeScanner } from "./entry/barcode-scanner";
import { lookupProductCodeAction } from "../../actions";

import type { Product, ProductContext, ProductType } from "../../types";
import type { ProductFormInput } from "./product-form.types";
import { toast } from "sonner";

type CreatePhase = "method" | "type" | "form";

interface ProductDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product?: Product | null;
  context: ProductContext;
  onSuccess: () => void;
  /** @deprecated prefer unified flow; kept for toolbar shortcuts */
  initialMode?: "wizard" | "quick" | "batch";
}

/**
 * Unified product creation:
 * 1) Entry method (manual | scan)
 * 2) Product type (drives capability-based steps)
 * 3) Form — multi-step for the type; scan can prefill; "Add another" keeps method+type
 */
export function ProductDialog({
  open,
  onOpenChange,
  product,
  context,
  onSuccess,
  initialMode = "wizard",
}: ProductDialogProps) {
  const isEdit = Boolean(product);

  const [phase, setPhase] = useState<CreatePhase>("method");
  const [method, setMethod] = useState<ProductEntryMethod | null>(null);
  const [productType, setProductType] = useState<ProductType | null>(null);
  const [prefill, setPrefill] = useState<Partial<ProductFormInput> | null>(null);
  const [formKey, setFormKey] = useState(0);
  const [showScanner, setShowScanner] = useState(false);
  const [savedCount, setSavedCount] = useState(0);

  useEffect(() => {
    if (!open) {
      return;
    }
    if (isEdit) {
      setPhase("form");
      setMethod(null);
      setProductType((product?.productType as ProductType) ?? null);
      setPrefill(null);
      setSavedCount(0);
      setShowScanner(false);
      return;
    }

    // Toolbar shortcuts map into the unified flow
    if (initialMode === "quick") {
      setMethod("scan");
      setPhase("type");
    } else if (initialMode === "batch") {
      setMethod("scan");
      setPhase("type");
    } else {
      setMethod(null);
      setPhase("method");
    }
    setProductType(null);
    setPrefill(null);
    setSavedCount(0);
    setShowScanner(false);
    setFormKey((k) => k + 1);
  }, [open, initialMode, isEdit, product]);

  const title = isEdit
    ? "Edit Product"
    : phase === "method"
      ? "Add products"
      : phase === "type"
        ? "Product type"
        : method === "scan"
          ? `Scan & add (${productType ?? "…"})`
          : `New ${productType ?? "product"}`;

  const description = isEdit
    ? "Update product information."
    : phase === "method"
      ? "Choose how you want to enter products."
      : phase === "type"
        ? "Steps and fields depend on this type and your enabled capabilities."
        : "Complete the steps below. After save you can add another without starting over.";

  function handleSaved() {
    onSuccess();
    if (isEdit) {
      onOpenChange(false);
      return;
    }
    // Stay in form phase for multi-add
    setSavedCount((c) => c + 1);
    setPrefill(
      productType
        ? {
            productType,
            categoryId: context.categories[0]?.id ?? "",
            trackInventory: productType !== "service",
          }
        : null,
    );
    setFormKey((k) => k + 1);
    setShowScanner(method === "scan");
    toast.message("Ready for the next product — same type and entry method.");
  }

  async function handleScanCode(code: string) {
    const result = await lookupProductCodeAction(code);
    if (result.product) {
      toast.message(
        `Code already used by “${result.product.name}”. Enter a different code or edit that product.`,
      );
      return;
    }
    setPrefill((prev) => ({
      ...prev,
      productType: productType ?? prev?.productType ?? "physical",
      barcode: code,
      categoryId: prev?.categoryId || context.categories[0]?.id || "",
      trackInventory: productType !== "service",
    }));
    setFormKey((k) => k + 1);
    setShowScanner(false);
    toast.success("Code applied — complete the remaining fields.");
  }

  return (
    <CrudDialog
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      description={description}
    >
      {!isEdit && phase !== "method" && (
        <div className="mb-4 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          <span className="rounded-full border px-2 py-0.5">
            {method === "scan" ? "Scan entry" : "Manual entry"}
          </span>
          {productType && (
            <span className="rounded-full border px-2 py-0.5">{productType}</span>
          )}
          {savedCount > 0 && (
            <span className="rounded-full border border-primary/40 bg-primary/5 px-2 py-0.5 text-primary">
              {savedCount} saved this session
            </span>
          )}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="ml-auto h-7 text-xs"
            onClick={() => {
              setPhase("method");
              setMethod(null);
              setProductType(null);
              setPrefill(null);
              setSavedCount(0);
            }}
          >
            Start over
          </Button>
        </div>
      )}

      {!isEdit && phase === "method" && (
        <EntryMethodSelector
          value={method}
          onSelect={(m) => {
            setMethod(m);
            setPhase("type");
          }}
        />
      )}

      {!isEdit && phase === "type" && (
        <div className="space-y-4">
          <ProductTypeSelector
            value={productType}
            businessCapabilities={context.businessCapabilities ?? []}
            onSelect={(type) => {
              setProductType(type);
              setPrefill({
                productType: type,
                categoryId: context.categories[0]?.id ?? "",
                trackInventory: type !== "service",
                sellingPrice: null,
                costPrice: null,
              });
              setPhase("form");
              setFormKey((k) => k + 1);
              setShowScanner(method === "scan");
            }}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setPhase("method")}
          >
            Back
          </Button>
        </div>
      )}

      {(isEdit || phase === "form") && productType && (
        <div className="space-y-4">
          {!isEdit && method === "scan" && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Scan a code to prefill barcode, then complete the type-specific
                  steps. After save, scan the next item without going back.
                </p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowScanner((v) => !v)}
                >
                  {showScanner ? "Hide scanner" : "Scan code"}
                </Button>
              </div>
              {showScanner && (
                <BarcodeScanner
                  onScan={(code) => void handleScanCode(code)}
                  onClose={() => setShowScanner(false)}
                />
              )}
            </div>
          )}

          <ProductForm
            key={formKey}
            product={product}
            context={context}
            prefill={prefill}
            lockedProductType={productType}
            onSuccess={handleSaved}
          />

          {!isEdit && (
            <div className="flex justify-end border-t pt-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Done
              </Button>
            </div>
          )}
        </div>
      )}
    </CrudDialog>
  );
}
