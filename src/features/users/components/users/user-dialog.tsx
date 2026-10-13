"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { UserForm } from "./user-form";

import type { User } from "../../types";

interface UserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user?: User;
  onSuccess?: () => void;
}

export function UserDialog({
  open,
  onOpenChange,
  user,
  onSuccess,
}: UserDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="
          flex max-h-[min(90vh,720px)] w-[95vw] max-w-lg flex-col gap-0
          overflow-hidden p-0 sm:w-full
        "
      >
        <DialogHeader
          className="
            shrink-0 rounded-none border-b bg-gradient-to-r
            from-indigo-50 via-background to-lime-50 p-4
            dark:from-indigo-950/40 dark:via-card dark:to-background
          "
        >
          <DialogTitle className="text-xl font-bold text-indigo-700 dark:text-indigo-300">
            {user ? "Edit User" : "Create User"}
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            {user
              ? "Update user details and access settings."
              : "Create a new system user and assign a role. Extra permissions are optional."}
          </p>
        </DialogHeader>

        <UserForm
          user={user}
          onSuccess={() => {
            onOpenChange(false);
            onSuccess?.();
          }}
        />
      </DialogContent>
    </Dialog>
  );
}
