"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import {
  BusinessOwnerForm,
} from "./business-owner-form";


interface BusinessOwnerDialogProps {

  open: boolean;

  onOpenChange:
  (open: boolean) => void;

  onSuccess?: () => void;

}


export function BusinessOwnerDialog({
  open,
  onOpenChange,
  onSuccess,
}: BusinessOwnerDialogProps) {


  return (

    <Dialog
      open={open}
      onOpenChange={onOpenChange}
    >

      <DialogContent
        className="
          w-[95vw]
          max-w-lg
          rounded-2xl
          border
          shadow-xl
        "
      >

        <DialogHeader
          className="
            rounded-xl
            bg-gradient-to-r
            from-indigo-50
            via-white
            to-lime-50
            p-4
            dark:from-indigo-950/30
            dark:via-background
            dark:to-lime-950/20
          "
        >

          <DialogTitle
            className="
              text-xl
              font-bold
              text-indigo-700
              dark:text-indigo-300
            "
          >
            Create Business Owner
          </DialogTitle>


          <p className="
            text-sm
            text-muted-foreground
          ">
            Register a new business owner on the GetAxe Platform.
          </p>


        </DialogHeader>


        <div className="pt-2">

          <BusinessOwnerForm

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