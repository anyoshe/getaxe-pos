"use client";

import {
  CrudDialog,
} from "@/components/crud";

import { WarehouseForm } from "./warehouse-form";
import type {
  Warehouse,
} from "../../types/warehouse";

import type {
  Branch,
} from "../../types/branch";

interface WarehouseDialogProps {
  open: boolean;

  onOpenChange: (
    open: boolean
  ) => void;

  warehouse?: Warehouse | null;

  branches: Branch[];
}
export function WarehouseDialog({
  open,
  onOpenChange,
  warehouse,
  branches,
}: WarehouseDialogProps) {

  return (
    <CrudDialog
      open={open}
      onOpenChange={onOpenChange}
      title={
        warehouse
          ? "Edit Warehouse"
          : "New Warehouse"
      }
      description={
        warehouse
          ? "Update warehouse information."
          : "Create a new warehouse."
      }
    >

    <WarehouseForm
  warehouse={warehouse}
  branches={branches}
  onSuccess={() =>
    onOpenChange(false)
  }
/>

    </CrudDialog>
  );
}