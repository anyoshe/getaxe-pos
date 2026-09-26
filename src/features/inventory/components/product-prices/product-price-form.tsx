"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm, useWatch } from "react-hook-form";

import {
  FormCheckbox,
  FormTextField,
  FormSearchableSelect,
} from "@/components/forms";
import { FormActions } from "@/components/crud";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { createProductPriceAction } from "../../actions/create-product-price";
import { updateProductPriceAction } from "../../actions/update-product-price";
import { setProductMarkupAction } from "../../actions/set-product-markup";

import type { ProductPrice } from "../../types/product-prices";
import type { Product } from "../../types/products";
import type { PriceList } from "../../types/price-lists";

interface ProductPriceFormValues {
  productId: string;
  priceListId: string;
  unitId: string;
  price: string;
  minimumQuantity: string;
  active: boolean;
}

interface ProductPriceFormProps {
  productPrice: ProductPrice | null;
  products: Product[];
  priceLists: PriceList[];
  units?: { id: string; name: string }[];
  onSuccess: () => void;
  onCancel: () => void;
}

function num(v: unknown): number | null {
  if (v == null || v === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function money(n: number | null) {
  if (n == null) return "—";
  return n.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function ProductPriceForm({
  productPrice,
  products,
  priceLists,
  units = [],
  onSuccess,
  onCancel,
}: ProductPriceFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  /** Markup % used only for the calculator (can differ from category). */
  const [calcMarkup, setCalcMarkup] = useState("");
  const [saveMarkupOnProduct, setSaveMarkupOnProduct] = useState(false);

  const form = useForm<ProductPriceFormValues>({
    defaultValues: {
      productId: productPrice?.productId ?? "",
      priceListId: productPrice?.priceListId ?? "",
      unitId: (productPrice as { unitId?: string | null })?.unitId ?? "",
      price: productPrice?.price ?? "",
      minimumQuantity: productPrice?.minimumQuantity ?? "1",
      active: productPrice?.active ?? true,
    },
  });

  const selectedProductId = useWatch({
    control: form.control,
    name: "productId",
  });

  const selectedProduct = useMemo(
    () => products.find((p) => p.id === selectedProductId) ?? null,
    [products, selectedProductId],
  );

  const costPrice = useMemo(() => {
    if (!selectedProduct) return null;
    const avg = num(selectedProduct.costPrice);
    if (avg != null && avg > 0) return avg;
    const last = num(
      (selectedProduct as { lastPurchaseCost?: number | string | null })
        .lastPurchaseCost,
    );
    return last != null && last > 0 ? last : avg;
  }, [selectedProduct]);

  const categoryMarkup = useMemo(() => {
    if (!selectedProduct) return null;
    return num(
      (selectedProduct as { category?: { markupPercent?: string | number | null } })
        .category?.markupPercent,
    );
  }, [selectedProduct]);

  const productMarkup = useMemo(() => {
    if (!selectedProduct) return null;
    return num(
      (selectedProduct as { markupPercent?: number | string | null }).markupPercent,
    );
  }, [selectedProduct]);

  // When product changes, seed calculator with product markup, else category
  useEffect(() => {
    if (!selectedProductId) {
      setCalcMarkup("");
      return;
    }
    if (productMarkup != null) {
      setCalcMarkup(String(productMarkup));
    } else if (categoryMarkup != null) {
      setCalcMarkup(String(categoryMarkup));
    } else {
      setCalcMarkup("");
    }
  }, [selectedProductId, productMarkup, categoryMarkup]);

  useEffect(() => {
    form.reset({
      productId: productPrice?.productId ?? "",
      priceListId: productPrice?.priceListId ?? "",
      unitId: (productPrice as { unitId?: string | null })?.unitId ?? "",
      price: productPrice?.price ?? "",
      minimumQuantity: productPrice?.minimumQuantity ?? "1",
      active: productPrice?.active ?? true,
    });
    setError(null);
  }, [productPrice, form]);

  const calcMarkupNum = num(calcMarkup);
  const calculatedSell =
    costPrice != null && calcMarkupNum != null && calcMarkupNum >= 0
      ? Math.round(costPrice * (1 + calcMarkupNum / 100) * 100) / 100
      : null;

  function applyCalculatedPrice() {
    if (calculatedSell == null) return;
    form.setValue("price", calculatedSell.toFixed(2), { shouldDirty: true });
  }

  async function onSubmit(values: ProductPriceFormValues) {
    setLoading(true);
    setError(null);

    try {
      if (saveMarkupOnProduct && values.productId && calcMarkup.trim() !== "") {
        const m = num(calcMarkup);
        if (m == null || m < 0) {
          setError("Enter a valid product markup % (0 or more).");
          return;
        }
        const mk = await setProductMarkupAction({
          productId: values.productId,
          markupPercent: m,
        });
        if (!mk.success) {
          setError(mk.message);
          return;
        }
      }

      const formData = new FormData();
      formData.set("productId", values.productId);
      formData.set("priceListId", values.priceListId);
      formData.set("unitId", values.unitId ?? "");
      formData.set("price", values.price);
      formData.set("minimumQuantity", values.minimumQuantity);
      formData.set("active", String(values.active));

      const result = productPrice
        ? await updateProductPriceAction(productPrice.id, formData)
        : await createProductPriceAction(formData);

      if (!result.success) {
        setError(result.message ?? "Unable to save product price.");
        return;
      }

      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to save product price.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-5">
        <FormSearchableSelect
          control={form.control}
          name="productId"
          options={products}
          placeholder="Select product"
          getValue={(product) => product.id}
          getLabel={(product) =>
            `${product.name}${product.sku ? ` (${product.sku})` : ""}`
          }
        />

        {selectedProduct && (
          <div className="space-y-3 rounded-xl border border-primary/25 bg-primary/5 p-4">
            <p className="text-sm font-semibold text-foreground">
              Price calculator
            </p>
            <p className="text-xs text-muted-foreground">
              See the cost, set a markup for this product if it differs from the
              category, then apply the result as the selling price.
            </p>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-lg border bg-background px-3 py-2">
                <p className="text-xs text-muted-foreground">Cost price</p>
                <p className="font-mono text-lg font-semibold tabular-nums">
                  {money(costPrice)}
                </p>
                {costPrice == null && (
                  <p className="text-[11px] text-amber-700 dark:text-amber-400">
                    No cost on product yet — receive stock or set cost on the
                    product first.
                  </p>
                )}
              </div>
              <div className="rounded-lg border bg-background px-3 py-2">
                <p className="text-xs text-muted-foreground">Category default</p>
                <p className="font-mono text-lg tabular-nums">
                  {categoryMarkup != null ? `${categoryMarkup}%` : "— not set"}
                </p>
                {productMarkup != null && (
                  <p className="text-[11px] text-muted-foreground">
                    Product override on file: {productMarkup}%
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="calc-markup">
                Markup % for this calculation
              </Label>
              <div className="flex flex-wrap items-center gap-2">
                <Input
                  id="calc-markup"
                  type="number"
                  min={0}
                  step="0.01"
                  placeholder={
                    categoryMarkup != null
                      ? `e.g. ${categoryMarkup} (category)`
                      : "e.g. 35"
                  }
                  value={calcMarkup}
                  onChange={(e) => setCalcMarkup(e.target.value)}
                  className="max-w-[140px] font-mono"
                />
                <span className="text-sm text-muted-foreground">%</span>
                {categoryMarkup != null && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setCalcMarkup(String(categoryMarkup))}
                  >
                    Use category {categoryMarkup}%
                  </Button>
                )}
              </div>
              <p className="text-[11px] text-muted-foreground">
                Change this when this product needs a different margin than the
                category (e.g. category 30%, this item 50%).
              </p>
            </div>

            <div className="flex flex-wrap items-end justify-between gap-3 rounded-lg border bg-background px-3 py-3">
              <div>
                <p className="text-xs text-muted-foreground">
                  Cost × (1 + markup%) =
                </p>
                <p className="font-mono text-xl font-bold tabular-nums text-foreground">
                  {money(calculatedSell)}
                </p>
                {costPrice != null && calcMarkupNum != null && (
                  <p className="mt-1 font-mono text-[11px] text-muted-foreground">
                    {money(costPrice)} × (1 + {calcMarkupNum}/100)
                  </p>
                )}
              </div>
              <Button
                type="button"
                disabled={calculatedSell == null}
                onClick={applyCalculatedPrice}
              >
                Put result in selling price
              </Button>
            </div>

            <label className="flex items-start gap-2 text-xs text-muted-foreground">
              <input
                type="checkbox"
                className="mt-0.5"
                checked={saveMarkupOnProduct}
                onChange={(e) => setSaveMarkupOnProduct(e.target.checked)}
              />
              <span>
                Also save this markup % on the product (overrides category for
                future GRN / apply-markup). Leave unchecked to only set the
                selling price for this price list.
              </span>
            </label>
          </div>
        )}

        <FormSearchableSelect
          control={form.control}
          name="priceListId"
          options={priceLists}
          placeholder="Select price list"
          getValue={(priceList) => priceList.id}
          getLabel={(priceList) =>
            `${priceList.name} (${priceList.code})`
          }
        />

        {units.length > 0 && (
          <div className="space-y-2">
            <label className="text-sm font-medium">Sales unit (optional)</label>
            <select
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              value={form.watch("unitId") ?? ""}
              onChange={(e) =>
                form.setValue("unitId", e.target.value, { shouldDirty: true })
              }
            >
              <option value="">Default / any unit</option>
              {units.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name}
                </option>
              ))}
            </select>
            <p className="text-xs text-muted-foreground">
              Price applies when POS sells in this unit (e.g. strip vs box).
            </p>
          </div>
        )}

        <FormTextField
          form={form}
          name="price"
          label="Selling price"
          placeholder="e.g. 135.00"
          type="number"
          description="Final price on this price list (POS). Use the calculator above or type manually."
        />

        <FormTextField
          form={form}
          name="minimumQuantity"
          label="Minimum Quantity"
          placeholder="e.g. 1"
          type="number"
        />

        <FormCheckbox
          control={form.control}
          name="active"
          label="Active product price"
        />
      </div>

      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-200">
          {error}
        </div>
      )}

      <FormActions
        loading={loading}
        submitLabel={
          productPrice ? "Update Product Price" : "Create Product Price"
        }
        onCancel={onCancel}
      />
    </form>
  );
}
