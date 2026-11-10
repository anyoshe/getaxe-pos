"use client";

import { useEffect, useState } from "react";

import { CrudDialog } from "@/components/crud";
import { Button } from "@/components/ui/button";

import { ProductForm } from "./product-form";
import { ProductQuickAdd } from "./product-quick-add";
import { ProductTypeSelector } from "./wizard/product-type-selector";
import {
  EntryMethodSelector,
  type ProductEntryMethod,
} from "./entry/entry-method-selector";
import { BarcodeScanner } from "./entry/barcode-scanner";
import { lookupProductCodeAction } from "../../actions";
import {
  buildProductCreateDefaults,
  isQuickAddFriendlyType,
  readStickyProductPrefs,
} from "./product-create-defaults";

import type { Product, ProductContext, ProductType } from "../../types";
import type { ProductFormInput } from "./product-form.types";
import { toast } from "sonner";

type CreatePhase = "quick" | "method" | "type" | "form";

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
 * Product create/edit:
 * - Default create → one-screen Quick add (same server action)
 * - Full form / medicine / scan → existing multi-step path
 * - Sticky category/type/units across "add another"
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

  const [phase, setPhase] = useState<CreatePhase>("quick");
  const [method, setMethod] = useState<ProductEntryMethod | null>("manual");
  const [productType, setProductType] = useState<ProductType | null>(null);
  const [prefill, setPrefill] = useState<Partial<ProductFormInput> | null>(null);
  const [formKey, setFormKey] = useState(0);
  const [quickKey, setQuickKey] = useState(0);
  const [showScanner, setShowScanner] = useState(false);
  const [savedCount, setSavedCount] = useState(0);

  useEffect(() => {
    if (!open) return;

    if (isEdit) {
      setPhase("form");
      setMethod(null);
      setProductType((product?.productType as ProductType) ?? null);
      setPrefill(null);
      setSavedCount(0);
      setShowScanner(false);
      return;
    }

    const sticky = readStickyProductPrefs();
    const defaults = buildProductCreateDefaults(context, { sticky });

    if (initialMode === "batch") {
      setMethod("scan");
      setProductType(
        (defaults.productType as ProductType) || sticky.productType || "physical",
      );
      setPhase("type");
      setPrefill(defaults);
      setShowScanner(true);
    } else if (initialMode === "wizard") {
      // Toolbar full wizard
      setMethod("manual");
      setPhase("type");
      setProductType(null);
      setPrefill(null);
      setShowScanner(false);
    } else {
      // Default + "quick": one-screen quick add
      setMethod("manual");
      setPhase("quick");
      setProductType((defaults.productType as ProductType) || "physical");
      setPrefill(defaults);
      setShowScanner(false);
    }

    setSavedCount(0);
    setFormKey((k) => k + 1);
    setQuickKey((k) => k + 1);
  }, [open, initialMode, isEdit, product, context]);

  const title = isEdit
    ? "Edit Product"
    : phase === "quick"
      ? "Quick add product"
      : phase === "method"
        ? "Add products"
        : phase === "type"
          ? "Product type"
          : method === "scan"
            ? `Scan & add (${productType ?? "…"})`
            : `New ${productType ?? "product"}`;

  const description = isEdit
    ? "Update product information."
    : phase === "quick"
      ? "Name, category, and price — units and tracking are filled for you. Save keeps category for the next item."
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
    setSavedCount((c) => c + 1);
    const sticky = readStickyProductPrefs();
    setPrefill(
      buildProductCreateDefaults(context, {
        sticky,
        productType: productType ?? sticky.productType ?? "physical",
        name: "",
        barcode: null,
        sku: null,
        costPrice: null,
        sellingPrice: null,
      }),
    );
    setFormKey((k) => k + 1);
    setShowScanner(method === "scan");
    toast.message("Ready for the next product — same type and entry method.");
  }

  function handleQuickSuccess(saved: {
    productType: ProductType;
    categoryId: string;
    stockUnitId: string | null;
  }) {
    onSuccess();
    setSavedCount((c) => c + 1);
    setProductType(saved.productType);
    setQuickKey((k) => k + 1);
    toast.message("Ready for the next product — category and type kept.");
  }

  async function handleScanCode(code: string) {
    const result = await lookupProductCodeAction(code);
    if (result.product) {
      toast.message(
        `Code already used by “${result.product.name}”. Enter a different code or edit that product.`,
      );
      return;
    }
    if (phase === "quick" || (productType && isQuickAddFriendlyType(productType))) {
      setPrefill((prev) => ({
        ...buildProductCreateDefaults(context, {
          ...(prev ?? {}),
          barcode: code,
          productType: productType ?? "physical",
        }),
      }));
      setPhase("quick");
      setQuickKey((k) => k + 1);
      setShowScanner(false);
      toast.success("Code applied — finish name and price.");
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

  function openFullForm(type: ProductType) {
    setProductType(type);
    setMethod("manual");
    if (!isQuickAddFriendlyType(type)) {
      setPhase("form");
      setPrefill(buildProductCreateDefaults(context, { productType: type }));
      setFormKey((k) => k + 1);
      return;
    }
    setPhase("type");
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
            {phase === "quick"
              ? "Quick add"
              : method === "scan"
                ? "Scan entry"
                : "Full form"}
          </span>
          {productType && phase !== "quick" && (
            <span className="rounded-full border px-2 py-0.5">{productType}</span>
          )}
          {savedCount > 0 && (
            <span className="rounded-full border border-primary/40 bg-primary/5 px-2 py-0.5 text-primary">
              {savedCount} saved this session
            </span>
          )}
          <div className="ml-auto flex gap-1">
            {phase === "quick" && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-7 text-xs"
                onClick={() => {
                  setPhase("method");
                  setMethod(null);
                }}
              >
                Scan / full form
              </Button>
            )}
            {phase !== "quick" && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-7 text-xs"
                onClick={() => {
                  setPhase("quick");
                  setMethod("manual");
                  setQuickKey((k) => k + 1);
                }}
              >
                Quick add
              </Button>
            )}
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-7 text-xs"
              onClick={() => {
                setPhase("quick");
                setMethod("manual");
                setProductType(null);
                setPrefill(null);
                setSavedCount(0);
                setQuickKey((k) => k + 1);
              }}
            >
              Start over
            </Button>
          </div>
        </div>
      )}

      {!isEdit && phase === "quick" && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowScanner((v) => !v)}
            >
              {showScanner ? "Hide scanner" : "Scan barcode"}
            </Button>
          </div>
          {showScanner && (
            <BarcodeScanner
              onScan={(code) => void handleScanCode(code)}
              onClose={() => setShowScanner(false)}
            />
          )}
          <ProductQuickAdd
            key={quickKey}
            context={context}
            initial={{
              productType: (prefill?.productType as ProductType) || productType || undefined,
              barcode: prefill?.barcode ?? undefined,
              sku: prefill?.sku ?? undefined,
              name: prefill?.name || undefined,
              categoryId: prefill?.categoryId || undefined,
              costPrice: prefill?.costPrice ?? null,
              sellingPrice: prefill?.sellingPrice ?? null,
            }}
            onSuccess={handleQuickSuccess}
            onOpenFullForm={(type) => {
              setProductType(type);
              setPrefill(
                buildProductCreateDefaults(context, {
                  productType: type,
                  categoryId: prefill?.categoryId,
                }),
              );
              setPhase("form");
              setFormKey((k) => k + 1);
            }}
          />
          <div className="flex justify-end border-t pt-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Done
            </Button>
          </div>
        </div>
      )}

      {!isEdit && phase === "method" && (
        <EntryMethodSelector
          value={method}
          onSelect={(m) => {
            setMethod(m);
            if (m === "manual") {
              setPhase("quick");
              setQuickKey((k) => k + 1);
              return;
            }
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
              const next = buildProductCreateDefaults(context, {
                productType: type,
              });
              setPrefill(next);
              if (isQuickAddFriendlyType(type) && method !== "scan") {
                setPhase("quick");
                setQuickKey((k) => k + 1);
              } else {
                setPhase("form");
                setFormKey((k) => k + 1);
                setShowScanner(method === "scan");
              }
            }}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setPhase("quick")}
          >
            Back to quick add
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
