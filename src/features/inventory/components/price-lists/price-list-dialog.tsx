"use client";

import {
  CrudDialog,
} from "@/components/crud";

import {
  PriceListForm,
} from "./price-list-form";

import type {
  PriceList,
} from "../../types/price-lists";

interface PriceListDialogProps {
  open: boolean;

  onOpenChange: (
    open: boolean
  ) => void;

  priceList: PriceList | null;

  onSuccess: () => void;
}

export function PriceListDialog({
  open,
  onOpenChange,
  priceList,
  onSuccess,
}: PriceListDialogProps) {
  const editing =
    priceList !== null;

  return (
    <CrudDialog
      open={open}
      onOpenChange={onOpenChange}
      title={
        editing
          ? "Edit Price List"
          : "Create Price List"
      }
      description={
        editing
          ? "Update the price list details."
          : "Add a new inventory price list."
      }
    >
      <PriceListForm
        priceList={priceList}
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
