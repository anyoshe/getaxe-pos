"use client";

import {
  CrudDialog,
} from "@/components/crud";

import { BranchForm } from "./branch-form";

import type { Branch } from "../types";

interface BranchDialogProps {
  open: boolean;

  onOpenChange: (
    open: boolean
  ) => void;

  branch?: Branch | null;
}

export function BranchDialog({
  open,
  onOpenChange,
  branch,
}: BranchDialogProps) {

  return (
    <CrudDialog
      open={open}
      onOpenChange={onOpenChange}
      title={
        branch
          ? "Edit Branch"
          : "New Branch"
      }
      description={
        branch
          ? "Update branch information."
          : "Create a new business branch."
      }
    >
      <BranchForm
        branch={branch}
        onSuccess={() =>
          onOpenChange(false)
        }
      />

    </CrudDialog>
  );
}