"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm, useWatch } from "react-hook-form";

import {
  FormActions,
  FormCheckbox,
  FormTextField,
  FormTextarea,
} from "@/components/forms";

import {
  createCategoryAction,
} from "../../actions/create-category";

import {
  updateCategoryAction,
} from "../../actions/update-category";

import {
  applyCategoryMarkupAction,
  type MarkupPreviewLine,
} from "../../actions/apply-category-markup";

import type { Category } from "../../types/categories";

type CategoryFormValues = {
  name: string;
  description: string;
  markupPercent: string;
  active: boolean;
};

interface CategoryFormProps {
  category?: Category | null;
  onSuccess: () => void;
  onCancel: () => void;
}

function formatKes(n: number) {
  return n.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function CategoryForm({
  category,
  onSuccess,
  onCancel,
}: CategoryFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewLines, setPreviewLines] = useState<MarkupPreviewLine[] | null>(
    null,
  );
  const [previewNote, setPreviewNote] = useState<string | null>(null);
  const [applyLoading, setApplyLoading] = useState(false);

  const form = useForm<CategoryFormValues>({
    defaultValues: {
      name: category?.name ?? "",
      description: category?.description ?? "",
      markupPercent:
        category?.markupPercent != null ? String(category.markupPercent) : "",
      active: category?.active ?? true,
    },
  });

  useEffect(() => {
    form.reset({
      name: category?.name ?? "",
      description: category?.description ?? "",
      markupPercent:
        category?.markupPercent != null ? String(category.markupPercent) : "",
      active: category?.active ?? true,
    });
    setError(null);
    setPreviewLines(null);
    setPreviewNote(null);
  }, [category, form]);

  const markupWatch = useWatch({ control: form.control, name: "markupPercent" });

  const liveExamples = useMemo(() => {
    const raw = String(markupWatch ?? "").replace(/%/g, "").trim();
    if (raw === "") return null;
    const m = Number(raw);
    if (!Number.isFinite(m) || m < 0) return null;
    const samples = [100, 500, 1000, 40];
    return samples.map((cost) => ({
      cost,
      sell: Math.round(cost * (1 + m / 100) * 100) / 100,
      markup: m,
    }));
  }, [markupWatch]);

  async function onSubmit(values: CategoryFormValues) {
    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.set("name", values.name);
      formData.set("description", values.description ?? "");
      formData.set("markupPercent", (values.markupPercent ?? "").trim());
      formData.set("active", String(values.active));

      const result = category
        ? await updateCategoryAction(category.id, formData)
        : await createCategoryAction(formData);

      if (!result.success) {
        setError(result.message ?? "Unable to save category.");
        return;
      }

      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to save category.");
    } finally {
      setLoading(false);
    }
  }

  async function runMarkupPreview(commit: boolean) {
    if (!category?.id) {
      setError("Save the category with a markup % first, then apply to products.");
      return;
    }
    setApplyLoading(true);
    setError(null);
    setPreviewNote(null);
    try {
      const result = await applyCategoryMarkupAction({
        categoryId: category.id,
        commit,
      });
      if (!result.success) {
        setError(result.message);
        setPreviewLines(null);
        return;
      }
      setPreviewLines(result.lines);
      setPreviewNote(result.message);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Markup apply failed.");
    } finally {
      setApplyLoading(false);
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
          rows={3}
        />

        <FormTextField
          form={form}
          name="markupPercent"
          label="Default markup % (on cost)"
          placeholder="e.g. 35 for 35%"
          description="Sell ≈ average cost × (1 + markup%). Example: cost 100 + 35% → sell 135. Leave blank to price manually."
        />

        {liveExamples && (
          <div className="rounded-xl border border-primary/20 bg-primary/5 px-4 py-3 text-sm">
            <p className="font-medium text-foreground">
              Markup preview ({liveExamples[0].markup}%)
            </p>
            <p className="mt-1 text-muted-foreground">
              Cost → suggested sell (before you save / apply to products)
            </p>
            <ul className="mt-2 grid gap-1 sm:grid-cols-2">
              {liveExamples.map((ex) => (
                <li key={ex.cost} className="font-mono text-xs sm:text-sm">
                  <span className="text-muted-foreground">Cost</span>{" "}
                  {formatKes(ex.cost)}{" "}
                  <span className="text-muted-foreground">→</span>{" "}
                  <span className="font-semibold text-foreground">
                    Sell {formatKes(ex.sell)}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <FormCheckbox
          control={form.control}
          name="active"
          label="Active category"
        />
      </div>

      {category?.id && (
        <div className="space-y-3 rounded-xl border bg-muted/30 p-4">
          <p className="text-sm font-medium">Apply to existing products</p>
          <p className="text-xs text-muted-foreground">
            Uses each product’s cost (moving average) × this category’s saved
            markup, and updates the default price list. Preview first, then
            confirm.
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              disabled={applyLoading || loading}
              onClick={() => runMarkupPreview(false)}
              className="rounded-lg border bg-background px-3 py-2 text-sm font-medium hover:bg-muted disabled:opacity-50"
            >
              {applyLoading ? "Working…" : "Preview cost → sell"}
            </button>
            <button
              type="button"
              disabled={applyLoading || loading}
              onClick={() => runMarkupPreview(true)}
              className="rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50"
            >
              Apply markup to prices
            </button>
          </div>
          {previewNote && (
            <p className="text-sm text-foreground">{previewNote}</p>
          )}
          {previewLines && previewLines.length > 0 && (
            <div className="max-h-56 overflow-auto rounded-lg border bg-background">
              <table className="w-full text-left text-xs">
                <thead className="sticky top-0 bg-muted/80">
                  <tr>
                    <th className="p-2">Product</th>
                    <th className="p-2">Cost</th>
                    <th className="p-2">Was</th>
                    <th className="p-2">New sell</th>
                    <th className="p-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {previewLines.map((line) => (
                    <tr key={line.productId} className="border-t">
                      <td className="p-2">
                        <div className="font-medium">{line.name}</div>
                        <div className="text-muted-foreground">
                          {line.sku || "—"}
                        </div>
                      </td>
                      <td className="p-2 font-mono">
                        {formatKes(line.costPrice)}
                      </td>
                      <td className="p-2 font-mono">
                        {line.previousSell != null
                          ? formatKes(line.previousSell)
                          : "—"}
                      </td>
                      <td className="p-2 font-mono font-semibold">
                        {line.suggestedSell > 0
                          ? formatKes(line.suggestedSell)
                          : "—"}
                      </td>
                      <td className="p-2">
                        {line.skippedReason
                          ? line.skippedReason
                          : line.applied
                            ? "Applied"
                            : "Ready"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {previewLines && previewLines.length === 0 && (
            <p className="text-xs text-muted-foreground">
              No active products in this category yet.
            </p>
          )}
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-200">
          {error}
        </div>
      )}

      <FormActions
        loading={loading}
        submitLabel={category ? "Update Category" : "Create Category"}
        onCancel={onCancel}
      />
    </form>
  );
}
