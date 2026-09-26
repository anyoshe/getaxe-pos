"use client";

import { Edit, Trash2 } from "lucide-react";

import { CrudTable } from "@/components/crud";

import type { ProductPrice } from "../../types/product-prices";
import {
  effectiveMarkupFromPriceRow,
  productCostFromPriceRow,
} from "../../types/product-prices";

interface ProductPriceTableProps {
  data: ProductPrice[];
  onEdit: (productPrice: ProductPrice) => void;
  onDelete: (productPrice: ProductPrice) => void;
}

function formatMoney(n: number | null | undefined) {
  if (n == null || !Number.isFinite(n)) return "—";
  return n.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
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
          render: (row) => (
            <div>
              <div className="font-medium">{row.product?.name ?? "—"}</div>
              {row.product?.category?.name ? (
                <div className="text-xs text-muted-foreground">
                  {row.product.category.name}
                </div>
              ) : null}
            </div>
          ),
        },
        {
          key: "sku",
          title: "SKU",
          render: (row) => row.product?.sku || "—",
        },
        {
          key: "priceList",
          title: "Price list",
          render: (row) => row.priceList?.name ?? "—",
        },
        {
          key: "costPrice",
          title: "Cost",
          render: (row) => {
            const cost = productCostFromPriceRow(row);
            return (
              <span className="font-mono tabular-nums">{formatMoney(cost)}</span>
            );
          },
        },
        {
          key: "markup",
          title: "Markup %",
          render: (row) => {
            const m = effectiveMarkupFromPriceRow(row);
            if (m == null) {
              return (
                <span className="text-muted-foreground" title="Set on category or product">
                  —
                </span>
              );
            }
            const fromProduct =
              row.product?.markupPercent != null &&
              row.product.markupPercent !== "";
            return (
              <span className="font-mono tabular-nums" title={fromProduct ? "Product override" : "From category"}>
                {m}%
                <span className="ml-1 text-[10px] text-muted-foreground">
                  {fromProduct ? "prod" : "cat"}
                </span>
              </span>
            );
          },
        },
        {
          key: "price",
          title: "Selling price",
          render: (row) => {
            const sell = Number(row.price);
            const cost = productCostFromPriceRow(row);
            const m = effectiveMarkupFromPriceRow(row);
            const suggested =
              cost != null && m != null
                ? Math.round(cost * (1 + m / 100) * 100) / 100
                : null;
            return (
              <div>
                <div className="font-mono font-semibold tabular-nums">
                  {formatMoney(Number.isFinite(sell) ? sell : null)}
                </div>
                {suggested != null &&
                  Number.isFinite(sell) &&
                  Math.abs(suggested - sell) > 0.009 && (
                    <div
                      className="text-[10px] text-amber-700 dark:text-amber-400"
                      title="Suggested from cost × markup differs from list price"
                    >
                      markup would be {formatMoney(suggested)}
                    </div>
                  )}
              </div>
            );
          },
        },
        {
          key: "minimumQuantity",
          title: "Min qty",
          render: (row) => row.minimumQuantity,
        },
        {
          key: "active",
          title: "Status",
          render: (row) => (
            <span
              className={
                row.active ? "text-emerald-600" : "text-muted-foreground"
              }
            >
              {row.active ? "Active" : "Inactive"}
            </span>
          ),
        },
      ]}
      actions={[
        {
          label: "Edit",
          icon: <Edit className="h-4 w-4" />,
          onClick: onEdit,
        },
        {
          label: "Delete",
          icon: <Trash2 className="h-4 w-4" />,
          onClick: onDelete,
        },
      ]}
      emptyMessage="No product prices found. Apply category markup or add prices manually."
    />
  );
}
