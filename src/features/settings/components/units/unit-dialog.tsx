"use client";

import {
  CrudDialog,
} from "@/components/crud";

import {
  UnitForm,
} from "./unit-form";

import type {
  Unit,
} from "../../types";


interface UnitDialogProps {
  open: boolean;

  onOpenChange: (
    open: boolean
  ) => void;

  unit?: Unit | null;
}


export function UnitDialog({
  open,
  onOpenChange,
  unit,
}: UnitDialogProps) {

  return (
    <CrudDialog
      open={open}
      onOpenChange={onOpenChange}
      title={
        unit
          ? "Edit Unit"
          : "New Unit"
      }
      description={
        unit
          ? "Update unit information."
          : "Create a new unit."
      }
    >

      <UnitForm
        unit={unit}
        onSuccess={() =>
          onOpenChange(false)
        }
      />

    </CrudDialog>
  );
}