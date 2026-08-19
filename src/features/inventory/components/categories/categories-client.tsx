"use client";

import {
  useMemo,
  useState,
} from "react";

import {
  useRouter,
} from "next/navigation";

import {
  CrudPage,
  DeleteDialog,
} from "@/components/crud";

import {
  deleteCategoryAction,
} from "../../actions/delete-category";

import {
  CategoryDialog,
} from "./category-dialog";

import {
  CategoryTable,
} from "./category-table";

import {
  CategoryToolbar,
} from "./category-toolbar";

import type {
  Category,
} from "../../types/categories";

interface CategoriesClientProps {
  categories: Category[];
}

export function CategoriesClient({
  categories,
}: CategoriesClientProps) {
  const router =
    useRouter();

  const [search, setSearch] =
    useState("");

  const [open, setOpen] =
    useState(false);

  const [
    selectedCategory,
    setSelectedCategory,
  ] = useState<Category | null>(
    null
  );

  const [
    deleteOpen,
    setDeleteOpen,
  ] = useState(false);

  const [deleting, setDeleting] =
    useState(false);

  const filteredCategories =
    useMemo(() => {
      const query =
        search
          .trim()
          .toLowerCase();

      if (!query) {
        return categories;
      }

      return categories.filter(
        (category) =>
          category.name
            .toLowerCase()
            .includes(query) ||
          category.description
            ?.toLowerCase()
            .includes(query)
      );
    }, [categories, search]);

  return (
    <CrudPage
      title="Categories"
      description="Manage inventory categories."
      createLabel="Create Category"
      onCreate={() => {
        setSelectedCategory(null);
        setOpen(true);
      }}
    >
      <div className="space-y-6">
        <CategoryToolbar
          search={search}
          onSearchChange={setSearch}
        />

        <CategoryTable
          data={filteredCategories}
          onEdit={(category) => {
            setSelectedCategory(
              category
            );
            setOpen(true);
          }}
          onDelete={(category) => {
            setSelectedCategory(
              category
            );
            setDeleteOpen(true);
          }}
        />

        <CategoryDialog
          open={open}
          onOpenChange={setOpen}
          category={
            selectedCategory
          }
          onSuccess={() => {
            router.refresh();
          }}
        />

        <DeleteDialog
          open={deleteOpen}
          loading={deleting}
          title="Archive Category?"
          description={
            selectedCategory
              ? `Archive "${selectedCategory.name}"?`
              : ""
          }
          onCancel={() => {
            setDeleteOpen(false);
            setSelectedCategory(null);
          }}
          onConfirm={async () => {
            if (!selectedCategory) {
              return;
            }

            try {
              setDeleting(true);

              const result =
                await deleteCategoryAction(
                  selectedCategory.id
                );

              if (!result.success) {
                return;
              }

              router.refresh();

              setDeleteOpen(false);
              setSelectedCategory(null);
            } finally {
              setDeleting(false);
            }
          }}
        />
      </div>
    </CrudPage>
  );
}