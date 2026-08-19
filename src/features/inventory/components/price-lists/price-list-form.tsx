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
  createPriceListAction,
} from "../../actions/create-price-list";

import {
  updatePriceListAction,
} from "../../actions/update-price-list";

import type {
  PriceList,
} from "../../types/price-lists";

interface PriceListFormValues {
  code: string;
  name: string;
  description: string;
  isDefault: boolean;
  active: boolean;
}

interface PriceListFormProps {
  priceList: PriceList | null;

  onSuccess: () => void;

  onCancel: () => void;
}

export function PriceListForm({
  priceList,
  onSuccess,
  onCancel,
}: PriceListFormProps) {
  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  const form =
    useForm<PriceListFormValues>({
      defaultValues: {
        code:
          priceList?.code ?? "",

        name:
          priceList?.name ?? "",

        description:
          priceList?.description ?? "",

        isDefault:
          priceList?.isDefault ?? false,

        active:
          priceList?.active ?? true,
      },
    });

  useEffect(() => {
    form.reset({
      code:
        priceList?.code ?? "",

      name:
        priceList?.name ?? "",

      description:
        priceList?.description ?? "",

      isDefault:
        priceList?.isDefault ?? false,

      active:
        priceList?.active ?? true,
    });

    setError(null);
  }, [priceList, form]);

  async function onSubmit(
    values: PriceListFormValues
  ) {
    setLoading(true);
    setError(null);

    try {
      const formData =
        new FormData();

      formData.set(
        "code",
        values.code
      );

      formData.set(
        "name",
        values.name
      );

      formData.set(
        "description",
        values.description
      );

      formData.set(
        "isDefault",
        String(values.isDefault)
      );

      formData.set(
        "active",
        String(values.active)
      );

      const result =
        priceList
          ? await updatePriceListAction(
              priceList.id,
              formData
            )
          : await createPriceListAction(
              formData
            );

      if (!result.success) {
        setError(
          result.message ??
            "Unable to save price list."
        );

        return;
      }

      onSuccess();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to save price list."
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
          name="code"
          label="Price List Code"
          placeholder="e.g. RETAIL"
        />

        <FormTextField
          form={form}
          name="name"
          label="Price List Name"
          placeholder="e.g. Retail Price"
        />

        <FormTextarea
          form={form}
          name="description"
          label="Description"
          placeholder="Describe this price list..."
          rows={4}
        />

        <FormCheckbox
          control={form.control}
          name="isDefault"
          label="Default price list"
        />

        <FormCheckbox
          control={form.control}
          name="active"
          label="Active price list"
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
          priceList
            ? "Update Price List"
            : "Create Price List"
        }
        onCancel={onCancel}
      />
    </form>
  );
}