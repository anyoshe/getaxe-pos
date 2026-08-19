"use client";

import {
  CrudDialog,
} from "@/components/crud";

import {
  ProductPriceForm,
} from "./product-price-form";

import type {
  ProductPrice,
} from "../../types/product-prices";

import type {
  Product,
} from "../../types/products";

import type {
  PriceList,
} from "../../types/price-lists";

interface ProductPriceDialogProps {
  open: boolean;

  onOpenChange: (
    open: boolean
  ) => void;

  productPrice: ProductPrice | null;

  products: Product[];

  priceLists: PriceList[];

  onSuccess: () => void;
}

export function ProductPriceDialog({
  open,
  onOpenChange,
  productPrice,
  products,
  priceLists,
  onSuccess,
}: ProductPriceDialogProps) {
  const editing =
    productPrice !== null;

  return (
    <CrudDialog
      open={open}
      onOpenChange={onOpenChange}
      title={
        editing
          ? "Edit Product Price"
          : "Create Product Price"
      }
      description={
        editing
          ? "Update the product price."
          : "Add a price for a product."
      }
    >
      <ProductPriceForm
        productPrice={productPrice}
        products={products}
        priceLists={priceLists}
        onSuccess={() => {
          onOpenChange(false);
          onSuccess();
        }}
        onCancel={() =>
          onOpenChange(false)
        }
      />
    </CrudDialog>
  );
}