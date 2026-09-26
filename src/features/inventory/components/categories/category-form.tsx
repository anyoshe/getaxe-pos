"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm, useWatch } from "react-hook-form";

import {
  FormCheckbox,
  FormTextField,
  FormTextarea,
} from "@/components/forms";

import { FormActions } from "@/components/crud";

import { createCategoryAction } from "../../actions/create-category";
import { updateCategoryAction } from "../../actions/update-category";
import {
  applyCategoryMarkupAction,
  type MarkupPreviewLine,
  type MarkupTarget,
} from "../../actions/apply-category-markup";

import type { Category } from "../../types/categories";

type CategoryFormValues = {
  name: string;
  description: string;
  markupPercent: string;
  wholesaleMarkupPercent: string;
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

function markupExamples(raw: string | undefined) {
  const s = String(raw ?? "").replace(/%/g, "").trim();
  if (s === "") return null;
  const m = Number(s);
  if (!Number.isFinite(m) || m < 0) return null;
  return [100, 500, 1000].map((cost) => ({
    cost,
    sell: Math.round(cost * (1 + m / 100) * 100) / 100,
    markup: m,
  }));
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
  const [previewTarget, setPreviewTarget] = useState<MarkupTarget | null>(null);
  const [applyLoading, setApplyLoading] = useState(false);

  const form = useForm<CategoryFormValues>({
    defaultValues: {
      name: category?.name ?? "",
      description: category?.description ?? "",
      markupPercent:
        category?.markupPercent != null ? String(category.markupPercent) : "",
      wholesaleMarkupPercent:
        category?.wholesaleMarkupPercent != null
          ? String(category.wholesaleMarkupPercent)
          : "",
      active: category?.active ?? true,
    },
  });

  useEffect(() => {
    form.reset({
      name: category?.name ?? "",
      description: category?.description ?? "",
      markupPercent:
        category?.markupPercent != null ? String(category.markupPercent) : "",
      wholesaleMarkupPercent:
        category?.wholesaleMarkupPercent != null
          ? String(category.wholesaleMarkupPercent)
          : "",
      active: category?.active ?? true,
    });
    setError(null);
    setPreviewLines(null);
    setPreviewNote(null);
    setPreviewTarget(null);
  }, [category, form]);

  const markupWatch = useWatch({
    control: form.control,
    name: "markupPercent",
  });
  const wholesaleWatch = useWatch({
    control: form.control,
    name: "wholesaleMarkupPercent",
  });

  const retailExamples = useMemo(
    () => markupExamples(markupWatch),
    [markupWatch],
  );
  const wholesaleExamples = useMemo(
    () => markupExamples(wholesaleWatch),
    [wholesaleWatch],
  );

  async function onSubmit(values: CategoryFormValues) {
    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.set("name", values.name);
    formData.set("description", values.description ?? "");
    formData.set("markupPercent", values.markupPercent ?? "");
    formData.set("wholesaleMarkupPercent", values.wholesaleMarkupPercent ?? "");
    formData.set("active", values.active ? "true" : "false");

    try {
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

  async function runMarkup(target: MarkupTarget, commit: boolean) {
    if (!category?.id) return;
    setApplyLoading(true);
    setError(null);
    try {
      const result = await applyCategoryMarkupAction({
        categoryId: category.id,
        commit,
        target,
      });
      if (!result.success) {
        setError(result.message);
        return;
      }
      setPreviewLines(result.lines);
      setPreviewNote(result.message);
      setPreviewTarget(target);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Markup action failed.");
    } finally {
      setApplyLoading(false);
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
      <div className="space-y-4">
        <FormTextField
          form={form}
          name="name"
          label="Category name"
          required
        />

        <FormTextarea
          form={form}
          name="description"
          label="Description"
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <FormTextField
              form={form}
              name="markupPercent"
              label="Retail markup %"
              type="number"
              placeholder="e.g. 35"
            />
            <p className="text-xs text-muted-foreground">
              Default / retail list: sell ≈ cost × (1 + %). Leave blank to price
              retail manually.
            </p>
            {retailExamples && (
              <div className="rounded-lg border border-primary/20 bg-primary/5 px-3 py-2 text-xs">
                <p className="font-medium">
                  Retail preview ({retailExamples[0].markup}%)
                </p>
                <ul className="mt-1 space-y-0.5 font-mono">
                  {retailExamples.map((ex) => (
                    <li key={ex.cost}>
                      Cost {formatKes(ex.cost)} → Sell {formatKes(ex.sell)}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <FormTextField
              form={form}
              name="wholesaleMarkupPercent"
              label="Wholesale markup %"
              type="number"
              placeholder="e.g. 15"
            />
            <p className="text-xs text-muted-foreground">
              Wholesale / trade list only. Does not change retail prices. Leave
              blank if you set wholesale prices by hand.
            </p>
            {wholesaleExamples && (
              <div className="rounded-lg border border-sky-500/25 bg-sky-500/5 px-3 py-2 text-xs">
                <p className="font-medium">
                  Wholesale preview ({wholesaleExamples[0].markup}%)
                </p>
                <ul className="mt-1 space-y-0.5 font-mono">
                  {wholesaleExamples.map((ex) => (
                    <li key={ex.cost}>
                      Cost {formatKes(ex.cost)} → WS {formatKes(ex.sell)}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

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
            Save the category first. Retail markup updates the default price
            list; wholesale markup updates (or creates) the Wholesale list used
            at POS. Price-locked products are skipped.
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              disabled={applyLoading}
              onClick={() => runMarkup("retail", false)}
              className="rounded-md border border-border bg-background px-3 py-1.5 text-xs font-medium hover:bg-muted disabled:opacity-50"
            >
              Preview retail
            </button>
            <button
              type="button"
              disabled={applyLoading}
              onClick={() => runMarkup("retail", true)}
              className="rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50"
            >
              Apply retail markup
            </button>
            <button
              type="button"
              disabled={applyLoading}
              onClick={() => runMarkup("wholesale", false)}
              className="rounded-md border border-sky-500/40 bg-background px-3 py-1.5 text-xs font-medium hover:bg-sky-500/10 disabled:opacity-50"
            >
              Preview wholesale
            </button>
            <button
              type="button"
              disabled={applyLoading}
              onClick={() => runMarkup("wholesale", true)}
              className="rounded-md bg-sky-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-sky-700 disabled:opacity-50"
            >
              Apply wholesale markup
            </button>
          </div>
          {previewNote && (
            <p className="text-xs text-muted-foreground">
              {previewTarget ? (
                <span className="font-medium capitalize">{previewTarget}: </span>
              ) : null}
              {previewNote}
            </p>
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
