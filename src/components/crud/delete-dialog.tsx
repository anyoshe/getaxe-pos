"use client";

import { AlertTriangle } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";

import type { DeleteDialogProps } from "./types";

export function DeleteDialog({
  open,
  title = "Delete Item?",
  description = "This action cannot be undone.",
  loading = false,
  onCancel,
  onConfirm,
}: DeleteDialogProps) {
  return (
    <Dialog
      open={open}
      onOpenChange={(value) => {
        if (!value) onCancel();
      }}
    >
      <DialogContent className="max-w-md rounded-3xl border-0 shadow-2xl">

        <DialogHeader className="items-center text-center">

          <div
            className="
              mb-4
              flex
              h-16
              w-16
              items-center
              justify-center
              rounded-full
              bg-red-100
            "
          >
            <AlertTriangle className="h-8 w-8 text-red-600" />
          </div>

          <DialogTitle className="text-xl">
            {title}
          </DialogTitle>

          <DialogDescription className="text-sm">
            {description}
          </DialogDescription>

        </DialogHeader>

        <div className="mt-6 flex gap-3 justify-end">

          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={loading}
            className="flex-1 rounded-xl"
          >
            Cancel
          </Button>

          <Button
            type="button"
            variant="destructive"
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 rounded-xl"
          >
            {loading ? "Deleting..." : "Delete"}
          </Button>

        </div>

      </DialogContent>
    </Dialog>
  );
}