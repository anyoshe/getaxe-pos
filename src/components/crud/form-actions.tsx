"use client";

import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";

import type { FormActionsProps } from "./types";

export function FormActions({
  loading = false,
  submitLabel = "Save",
  cancelLabel = "Cancel",
  onCancel,
}: FormActionsProps) {
  return (
    <div
      className="
        mt-8
        flex
        flex-col-reverse
        gap-3
        border-t
        border-border
        pt-6
        sm:flex-row
        sm:justify-end
      "
    >
      {onCancel && (
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={loading}
          className="
            w-full
            rounded-xl
            sm:w-auto
          "
        >
          {cancelLabel}
        </Button>
      )}

      <Button
        type="submit"
        disabled={loading}
        className="
          w-full
          rounded-xl
          bg-gradient-to-r
          from-indigo-600
          to-violet-600
          hover:from-indigo-700
          hover:to-violet-700
          sm:w-auto
        "
      >
        {loading && (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        )}

        {loading ? "Saving..." : submitLabel}
      </Button>
    </div>
  );
}