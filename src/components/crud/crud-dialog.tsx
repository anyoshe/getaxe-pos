"use client";

import type { ReactNode } from "react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import type { CrudDialogProps } from "./types";

export function CrudDialog({
  open,
  title,
  description,
  onOpenChange,
  children,
}: CrudDialogProps) {
  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
    >
      <DialogContent
        className="
          w-[95vw]
          max-w-3xl
          rounded-3xl
          border-0
          bg-card
          p-0
          shadow-2xl
          overflow-hidden
        "
      >
        <div className="border-b bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 px-8 py-6 text-white">

          <DialogHeader>

            <DialogTitle className="text-2xl font-bold">
              {title}
            </DialogTitle>

            {description && (
              <DialogDescription className="mt-2 text-white/85">
                {description}
              </DialogDescription>
            )}

          </DialogHeader>

        </div>

        <div
          className="
            max-h-[75vh]
            overflow-y-auto
            p-8
          "
        >
          {children}
        </div>

      </DialogContent>
    </Dialog>
  );
}