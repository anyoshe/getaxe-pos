"use client";

import {
  CrudDialog,
} from "@/components/crud";

import {
  ProductForm,
} from "./product-form";

import type {
  Product,
  ProductContext,
} from "../../types";


interface ProductDialogProps {

  open: boolean;

  onOpenChange: (
    open: boolean
  ) => void;

  product?: Product | null;

  context: ProductContext;

  onSuccess: () => void;
}

export function ProductDialog({
  open,
  onOpenChange,
  product,
  context,
  onSuccess,
}: ProductDialogProps) {
  return (
    <CrudDialog
      open={open}
      onOpenChange={onOpenChange}
      title={
        product
          ? "Edit Product"
          : "New Product"
      }
      description={
        product
          ? "Update product information."
          : "Create a new product."
      }
    >
      <ProductForm
        product={product}
        context={context}
        onSuccess={() => {
          onOpenChange(false);
          onSuccess();
        }}
      />
    </CrudDialog>
  );
}