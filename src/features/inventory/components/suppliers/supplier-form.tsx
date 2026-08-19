"use client";

import { useEffect, useState } from "react";

import {
  useForm,
} from "react-hook-form";

import {
  FormActions,
} from "@/components/crud";

import {
  FormCheckbox,
  FormSection,
  FormTextField,
  FormTextarea,
} from "@/components/forms";

import type {
  Supplier,
} from "../../types";

import {
  createSupplierAction,
} from "../../actions/create-supplier";

import {
  updateSupplierAction,
} from "../../actions/update-supplier";

interface SupplierFormValues {
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  kraPin: string;
  address: string;
  town: string;
  notes: string;
  active: boolean;
}

interface SupplierFormProps {
  supplier?: Supplier | null;

  onSuccess: () => void;

  onCancel: () => void;
}

export function SupplierForm({
  supplier,
  onSuccess,
  onCancel,
}: SupplierFormProps) {
  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  const form =
    useForm<SupplierFormValues>({
      defaultValues: {
        name: "",
        contactPerson: "",
        email: "",
        phone: "",
        kraPin: "",
        address: "",
        town: "",
        notes: "",
        active: true,
      },
    });

  useEffect(() => {
    form.reset({
      name: supplier?.name ?? "",
      contactPerson:
        supplier?.contactPerson ?? "",
      email: supplier?.email ?? "",
      phone: supplier?.phone ?? "",
      kraPin: supplier?.kraPin ?? "",
      address: supplier?.address ?? "",
      town: supplier?.town ?? "",
      notes: supplier?.notes ?? "",
      active: supplier?.active ?? true,
    });
  }, [supplier, form]);

  async function onSubmit(
    values: SupplierFormValues
  ) {
    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();

      formData.set(
        "name",
        values.name
      );

      formData.set(
        "contactPerson",
        values.contactPerson
      );

      formData.set(
        "email",
        values.email
      );

      formData.set(
        "phone",
        values.phone
      );

      formData.set(
        "kraPin",
        values.kraPin
      );

      formData.set(
        "address",
        values.address
      );

      formData.set(
        "town",
        values.town
      );

      formData.set(
        "notes",
        values.notes
      );

      formData.set(
        "active",
        String(values.active)
      );

      const result =
        supplier
          ? await updateSupplierAction(
              supplier.id,
              formData
            )
          : await createSupplierAction(
              formData
            );

      if (!result.success) {
        setError(
          result.message ??
            "Unable to save supplier."
        );
        return;
      }

      onSuccess();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to save supplier."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      className="space-y-6"
    >
      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
          {error}
        </div>
      )}

      <FormSection
        title="Basic Information"
        description="Identify the supplier and primary contact."
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <FormTextField
            form={form}
            name="name"
            label="Supplier Name"
            placeholder="e.g. ABC Supplies Ltd"
            disabled={loading}
          />

          <FormTextField
            form={form}
            name="contactPerson"
            label="Contact Person"
            placeholder="e.g. John Doe"
            disabled={loading}
          />
        </div>
      </FormSection>

      <FormSection
        title="Contact Information"
        description="How the business can contact this supplier."
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <FormTextField
            form={form}
            name="email"
            label="Email"
            type="email"
            placeholder="supplier@example.com"
            disabled={loading}
          />

          <FormTextField
            form={form}
            name="phone"
            label="Phone"
            placeholder="+254..."
            disabled={loading}
          />

          <FormTextField
            form={form}
            name="town"
            label="Town"
            placeholder="e.g. Mombasa"
            disabled={loading}
          />

          <FormTextField
            form={form}
            name="address"
            label="Address"
            placeholder="Physical or postal address"
            disabled={loading}
          />
        </div>
      </FormSection>

      <FormSection
        title="Business Information"
        description="Supplier registration and tax information."
      >
        <FormTextField
          form={form}
          name="kraPin"
          label="KRA PIN"
          placeholder="e.g. P051234567X"
          disabled={loading}
        />
      </FormSection>

      <FormSection
        title="Additional Information"
        description="Optional notes about this supplier."
      >
        <FormTextarea
          form={form}
          name="notes"
          label="Notes"
          placeholder="Add any relevant supplier notes..."
          rows={4}
          disabled={loading}
        />
      </FormSection>

      {supplier && (
        <FormSection
          title="Status"
          description="Control whether this supplier remains active."
        >
          <FormCheckbox
            control={form.control}
            name="active"
            label="Supplier is active"
            disabled={loading}
          />
        </FormSection>
      )}

      <FormActions
        loading={loading}
        submitLabel={
          supplier
            ? "Update Supplier"
            : "Create Supplier"
        }
        onCancel={onCancel}
      />
    </form>
  );
}