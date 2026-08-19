"use client";

import {
  CrudDialog,
} from "@/components/crud";

import {
  CategoryForm,
} from "./category-form";

import type {
  Category,
} from "../../types/categories";

interface CategoryDialogProps {
  open: boolean;

  onOpenChange: (
    open: boolean
  ) => void;

  category: Category | null;

  onSuccess: () => void;
}

export function CategoryDialog({
  open,
  onOpenChange,
  category,
  onSuccess,
}: CategoryDialogProps) {
  const editing =
    category !== null;

  return (
    <CrudDialog
      open={open}
      onOpenChange={onOpenChange}
      title={
        editing
          ? "Edit Category"
          : "Create Category"
      }
      description={
        editing
          ? "Update the category details."
          : "Add a new inventory category."
      }
    >
      <CategoryForm
        category={category}
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