"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

import {
  Separator,
} from "@/components/ui/separator";

import {
  RoleForm,
} from "./role-form";

interface Role {

  id: string;

  name: string;

  description: string | null;

  active: boolean;

  isSystem: boolean;

}

interface RoleDialogProps {

  open: boolean;

  onOpenChange: (
    open: boolean,
  ) => void;

  role?: Role;

  onSuccess?: () => void;

}

export function RoleDialog({

  open,

  onOpenChange,

  role,

  onSuccess,

}: RoleDialogProps) {

  return (

    <Dialog
      open={open}
      onOpenChange={onOpenChange}
    >

      <DialogContent
        className="
          sm:max-w-2xl
          rounded-2xl
          p-0
          overflow-hidden
          flex
          flex-col
        "
      >

        <div
          className="
            bg-gradient-to-r
            from-indigo-600
            to-indigo-700
            px-6
            py-5
            text-white
          "
        >

          <DialogHeader>

            <DialogTitle
              className="text-xl text-white"
            >

              {role
                ? "Edit Role"
                : "Create Role"}

            </DialogTitle>

            <DialogDescription
              className="text-indigo-100"
            >

              {role
                ? "Update role information and permissions."
                : "Create a new role for your organization."}

            </DialogDescription>

          </DialogHeader>

        </div>

        <Separator />

        <div className="
              flex-1
              overflow-y-auto
              p-6
         ">

          <RoleForm

            role={role}

            onSuccess={() => {

              onOpenChange(false);

              onSuccess?.();

            }}

          />

        </div>

      </DialogContent>

    </Dialog>

  );

}