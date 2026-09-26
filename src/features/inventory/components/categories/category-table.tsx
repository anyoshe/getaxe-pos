"use client";

import { Edit, Trash2 } from "lucide-react";

import { CrudTable, StatusBadge } from "@/components/crud";

import type { Category } from "../../types/categories";

interface CategoryTableProps {
  data: Category[];
  onEdit: (category: Category) => void;
  onDelete: (category: Category) => void;
}

export function CategoryTable({ data, onEdit, onDelete }: CategoryTableProps) {
  return (
    <CrudTable
      data={data}
      columns={[
        {
          key: "name",
          title: "Name",
          render: (category) => (
            <div>
              <div className="font-medium">{category.name}</div>
              {!category.active ? (
                <div className="text-[10px] text-amber-600 dark:text-amber-400">
                  Archived — still used by products; edit to set markup or
                  reactivate
                </div>
              ) : null}
            </div>
          ),
        },
        {
          key: "productCount",
          title: "Products",
          render: (category) =>
            category.productCount != null ? String(category.productCount) : "—",
        },
        {
          key: "description",
          title: "Description",
          render: (category) => category.description || "—",
          hidden: true,
        },
        {
          key: "markupPercent",
          title: "Retail %",
          render: (category) =>
            category.markupPercent != null && category.markupPercent !== ""
              ? `${Number(category.markupPercent)}%`
              : "—",
        },
        {
          key: "wholesaleMarkupPercent",
          title: "Wholesale %",
          render: (category) =>
            category.wholesaleMarkupPercent != null &&
            category.wholesaleMarkupPercent !== ""
              ? `${Number(category.wholesaleMarkupPercent)}%`
              : "—",
        },
        {
          key: "active",
          title: "Status",
          render: (category) => <StatusBadge active={category.active} />,
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
      emptyMessage="No categories found."
    />
  );
}
