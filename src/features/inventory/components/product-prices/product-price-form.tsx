"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  useForm,
} from "react-hook-form";

import {
  FormCheckbox,
  FormTextField,
  FormSearchableSelect,
} from "@/components/forms";

import {
  FormActions,
} from "@/components/crud";

import {
  createProductPriceAction,
} from "../../actions/create-product-price";

import {
  updateProductPriceAction,
} from "../../actions/update-product-price";

import type {
  ProductPrice,
} from "../../types/product-prices";

import type {
  Product,
} from "../../types/products";

import type {
  PriceList,
} from "../../types/price-lists";

interface ProductPriceFormValues {
  productId: string;

  priceListId: string;

  price: string;

  minimumQuantity: string;

  active: boolean;
}

interface ProductPriceFormProps {
  productPrice: ProductPrice | null;

  products: Product[];

  priceLists: PriceList[];

  onSuccess: () => void;

  onCancel: () => void;
}

export function ProductPriceForm({
  productPrice,
  products,
  priceLists,
  onSuccess,
  onCancel,
}: ProductPriceFormProps) {
  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  const form =
    useForm<ProductPriceFormValues>({
      defaultValues: {
        productId:
          productPrice?.productId ?? "",

        priceListId:
          productPrice?.priceListId ?? "",

        price:
          productPrice?.price ?? "",

        minimumQuantity:
          productPrice?.minimumQuantity ?? "1",

        active:
          productPrice?.active ?? true,
      },
    });

  useEffect(() => {
    form.reset({
      productId:
        productPrice?.productId ?? "",

      priceListId:
        productPrice?.priceListId ?? "",

      price:
        productPrice?.price ?? "",

      minimumQuantity:
        productPrice?.minimumQuantity ?? "1",

      active:
        productPrice?.active ?? true,
    });

    setError(null);
  }, [productPrice, form]);

  async function onSubmit(
    values: ProductPriceFormValues
  ) {
    setLoading(true);
    setError(null);

    try {
      const formData =
        new FormData();

      formData.set(
        "productId",
        values.productId
      );

      formData.set(
        "priceListId",
        values.priceListId
      );

      formData.set(
        "price",
        values.price
      );

      formData.set(
        "minimumQuantity",
        values.minimumQuantity
      );

      formData.set(
        "active",
        String(values.active)
      );

      const result =
        productPrice
          ? await updateProductPriceAction(
              productPrice.id,
              formData
            )
          : await createProductPriceAction(
              formData
            );

      if (!result.success) {
        setError(
          result.message ??
            "Unable to save product price."
        );

        return;
      }

      onSuccess();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to save product price."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={form.handleSubmit(
        onSubmit
      )}
      className="space-y-6"
    >
      <div className="space-y-5">
        <FormSearchableSelect
          control={form.control}
          name="productId"
          options={products}
          placeholder="Select product"
          getValue={(product) =>
            product.id
          }
          getLabel={(product) =>
            `${product.name}${product.sku ? ` (${product.sku})` : ""}`
          }
        />

        <FormSearchableSelect
          control={form.control}
          name="priceListId"
          options={priceLists}
          placeholder="Select price list"
          getValue={(priceList) =>
            priceList.id
          }
          getLabel={(priceList) =>
            `${priceList.name} (${priceList.code})`
          }
        />

        <FormTextField
          form={form}
          name="price"
          label="Price"
          placeholder="e.g. 100.00"
          type="number"
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
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      )}

      <FormActions
        loading={loading}
        submitLabel={
          productPrice
            ? "Update Product Price"
            : "Create Product Price"
        }
        onCancel={onCancel}
      />
    </form>
  );
}