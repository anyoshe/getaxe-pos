"use client";

import {
  CrudTable,
  StatusBadge,
} from "@/components/crud";

import type {
  Product,
} from "../../types";

interface ProductTableProps {
  data: Product[];

  onEdit: (
    product: Product
  ) => void;

  onDelete: (
    product: Product
  ) => void;
}

export function ProductTable({
  data,
  onEdit,
  onDelete,
}: ProductTableProps) {
  return (
    <CrudTable
      data={data}
      columns={[
        {
          key: "name",
          title: "Product",
          render: (product) => (
            <div>
              <div className="font-medium">
                {product.name}
              </div>

              {product.genericName && (
                <div className="text-sm text-muted-foreground">
                  {product.genericName}
                </div>
              )}
            </div>
          ),
        },

        {
          key: "sku",
          title: "SKU",
          render: (product) =>
            product.sku ?? "-",
        },

        {
          key: "category",
          title: "Category",
          render: (product) =>
            product.category?.name ?? "-",
        },

        {
          key: "stock",
          title: "Stock",
          render: (product) => {

            const quantity =
              product.inventoryBalances
                ?.reduce(
                  (
                    total,
                    balance
                  ) =>
                    total +
                    balance.quantity,
                  0
                ) ?? 0;

            return quantity;
          },
        },

        {
          key: "unit",
          title: "Unit",
          render: (product) =>
            product.stockUnit?.name ?? "-",
        },

        {
          key: "costPrice",
          title: "Cost",
          render: (product) =>
            product.costPrice
              ? `KES ${Number(
                product.costPrice
              ).toLocaleString()}`
              : "-",
        },

        {
          key: "sellingPrice",
          title: "Selling Price",
          render: (product) => {

            const price =
              product.prices?.[0];

            return price
              ? `KES ${Number(
                price.price
              ).toLocaleString()}`
              : "-";
          },
        },

        {
          key: "active",
          title: "Status",
          render: (product) => (
            <StatusBadge
              active={product.active}
            />
          ),
        },
      ]}
      actions={[
        {
          label: "Edit",
          onClick: onEdit,
        },
        {
          label: "Delete",
          variant: "destructive",
          onClick: onDelete,
        },
      ]}
    />
  );
}