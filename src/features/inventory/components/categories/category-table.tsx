"use client";

import {
  Edit,
  Trash2,
} from "lucide-react";

import {
  CrudTable,
  StatusBadge,
} from "@/components/crud";

import type {
  Category,
} from "../../types/categories";

interface CategoryTableProps {
  data: Category[];

  onEdit: (
    category: Category
  ) => void;

  onDelete: (
    category: Category
  ) => void;
}

export function CategoryTable({
  data,
  onEdit,
  onDelete,
}: CategoryTableProps) {
  return (
    <CrudTable
      data={data}
      columns={[
        {
          key: "name",
          title: "Name",
        },
        {
          key: "description",
          title: "Description",
          render: (category) =>
            category.description || "—",
          hidden: true,
        },
        {
          key: "active",
          title: "Status",
          render: (category) => (
            <StatusBadge
              active={category.active}
            />
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
      emptyMessage="No categories found."
    />
  );
}