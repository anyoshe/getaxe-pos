"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

import { BusinessOwnerForm } from "./business-owner-form";

interface BusinessOwnerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function BusinessOwnerDialog({
  open,
  onOpenChange,
  onSuccess,
}: BusinessOwnerDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Invite business owner</DialogTitle>
          <DialogDescription>
            Creates a first-time login. Share the temporary password so the
            client can open GetAxe and complete business setup.
          </DialogDescription>
        </DialogHeader>
        <BusinessOwnerForm
          onSuccess={() => {
            onSuccess?.();
          }}
        />
      </DialogContent>
    </Dialog>
  );
}
