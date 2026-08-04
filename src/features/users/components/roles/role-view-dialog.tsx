"use client";

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

import {
    RoleView,
} from "./role-view";

interface Permission {

    id: string;

    code: string;

    name: string;

    module: string;

    description: string | null;

}

interface Role {

    id: string;

    name: string;

    description: string | null;

    active: boolean;

    isSystem: boolean;

    permissions?: Permission[];

}

interface RoleViewDialogProps {

    open: boolean;

    onOpenChange: (
        open: boolean,
    ) => void;

    role?: Role;

}

export function RoleViewDialog({

    open,

    onOpenChange,

    role,

}: RoleViewDialogProps) {

    return (

        <Dialog
            open={open}
            onOpenChange={onOpenChange}
        >

          <DialogContent
    className="
        w-[95vw]
        h-[90vh]
        max-w-[1400px]
        overflow-hidden
        rounded-2xl
        p-0
    "
>
    <div className="
        h-full
        overflow-y-auto
        p-6
        lg:p-8
    ">
        <DialogHeader>
            <DialogTitle>
                Role Details
            </DialogTitle>
        </DialogHeader>

        {role && (
            <RoleView role={role} />
        )}
    </div>
</DialogContent>

        </Dialog>

    );

}