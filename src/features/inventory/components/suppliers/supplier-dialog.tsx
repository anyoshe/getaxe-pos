"use client";

import {
  CrudDialog,
} from "@/components/crud";

import type {
  Supplier,
} from "../../types";

import {
  SupplierForm,
} from "./supplier-form";

interface SupplierDialogProps {
  open: boolean;

  onOpenChange: (open: boolean) => void;

  supplier: Supplier | null;

  onSuccess: () => void;
}

export function SupplierDialog({
  open,
  onOpenChange,
  supplier,
  onSuccess,
}: SupplierDialogProps) {
  const editing = !!supplier;

  return (
    <CrudDialog
      open={open}
      onOpenChange={onOpenChange}
      title={
        editing
          ? "Edit Supplier"
          : "Add Supplier"
      }
      description={
        editing
          ? "Update supplier information."
          : "Add a new supplier to your inventory."
      }
    >
      <SupplierForm
        supplier={supplier}
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