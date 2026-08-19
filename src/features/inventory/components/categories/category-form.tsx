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
  FormTextarea,
  FormTextField,
} from "@/components/forms";

import {
  FormActions,
} from "@/components/crud";

import {
  createCategoryAction,
} from "../../actions/create-category";

import {
  updateCategoryAction,
} from "../../actions/update-category";

import type {
  Category,
} from "../../types/categories";

interface CategoryFormValues {
  name: string;
  description: string;
  active: boolean;
}

interface CategoryFormProps {
  category: Category | null;

  onSuccess: () => void;

  onCancel: () => void;
}

export function CategoryForm({
  category,
  onSuccess,
  onCancel,
}: CategoryFormProps) {
  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  const form =
    useForm<CategoryFormValues>({
      defaultValues: {
        name:
          category?.name ?? "",

        description:
          category?.description ?? "",

        active:
          category?.active ?? true,
      },
    });

  useEffect(() => {
    form.reset({
      name:
        category?.name ?? "",

      description:
        category?.description ?? "",

      active:
        category?.active ?? true,
    });

    setError(null);
  }, [category, form]);

  async function onSubmit(
    values: CategoryFormValues
  ) {
    setLoading(true);
    setError(null);

    try {
      const formData =
        new FormData();

      formData.set(
        "name",
        values.name
      );

      formData.set(
        "description",
        values.description
      );

      formData.set(
        "active",
        String(values.active)
      );

      const result =
        category
          ? await updateCategoryAction(
              category.id,
              formData
            )
          : await createCategoryAction(
              formData
            );

      if (!result.success) {
        setError(
          result.message ??
            "Unable to save category."
        );

        return;
      }

      onSuccess();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to save category."
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
        <FormTextField
          form={form}
          name="name"
          label="Category Name"
          placeholder="e.g. Electronics"
        />

        <FormTextarea
          form={form}
          name="description"
          label="Description"
          placeholder="Describe this category..."
          rows={4}
        />

        <FormCheckbox
          control={form.control}
          name="active"
          label="Active category"
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
          category
            ? "Update Category"
            : "Create Category"
        }
        onCancel={onCancel}
      />
    </form>
  );
}