"use client";

import {
  Edit,
  Trash2,
} from "lucide-react";

import {
  CrudTable,
} from "@/components/crud";

import type {
  ProductPrice,
} from "../../types/product-prices";

interface ProductPriceTableProps {
  data: ProductPrice[];

  onEdit: (
    productPrice: ProductPrice
  ) => void;

  onDelete: (
    productPrice: ProductPrice
  ) => void;
}

export function ProductPriceTable({
  data,
  onEdit,
  onDelete,
}: ProductPriceTableProps) {
  return (
    <CrudTable
      data={data}
      columns={[
        {
          key: "product",
          title: "Product",
          render: (productPrice) =>
            productPrice.product.name,
        },

        {
          key: "sku",
          title: "SKU",
          render: (productPrice) =>
            productPrice.product.sku || "—",
        },

        {
          key: "priceList",
          title: "Price List",
          render: (productPrice) =>
            productPrice.priceList.name,
        },

        {
          key: "minimumQuantity",
          title: "Minimum Qty",
          render: (productPrice) =>
            productPrice.minimumQuantity,
        },

        {
          key: "price",
          title: "Price",
          render: (productPrice) =>
            productPrice.price,
        },

        {
          key: "active",
          title: "Status",
          render: (productPrice) => (
            <span
              className={
                productPrice.active
                  ? "text-emerald-600"
                  : "text-muted-foreground"
              }
            >
              {productPrice.active
                ? "Active"
                : "Inactive"}
            </span>
          ),
        },
      ]}
      actions={[
        {
          label: "Edit",
          icon: (
            <Edit className="h-4 w-4" />
          ),
          onClick: onEdit,
        },

        {
          label: "Delete",
          icon: (
            <Trash2 className="h-4 w-4" />
          ),
          onClick: onDelete,
        },
      ]}
      emptyMessage="No product prices found."
    />
  );
}