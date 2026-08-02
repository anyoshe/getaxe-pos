"use client";

import type {
    ReactNode,
} from "react";

import {
    Label,
} from "@/components/ui/label";

interface FormFieldProps {

    label: string;

    required?: boolean;

    children: ReactNode;

}

export function FormField({
    label,
    required,
    children,
}: FormFieldProps) {

    return (

        <div className="space-y-2">

            <Label>

                {label}

                {required && (
                    <span className="text-destructive">
                        {" "}*
                    </span>
                )}

            </Label>

            {children}

        </div>

    );

}