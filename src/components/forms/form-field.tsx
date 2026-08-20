"use client";

import type { ReactNode } from "react";

import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface FormFieldProps {
    label: string;
    /** When true, shows a red asterisk. */
    required?: boolean;
    /**
     * When true and not required, shows a muted “(optional)” hint.
     * Defaults to showing optional when required is false.
     */
    showOptionalHint?: boolean;
    description?: string;
    children: ReactNode;
    className?: string;
}

export function FormField({
    label,
    required = false,
    showOptionalHint = true,
    description,
    children,
    className,
}: FormFieldProps) {
    return (
        <div className={cn("space-y-2", className)}>
            <div className="flex items-baseline gap-2">
                <Label className="text-sm font-medium leading-none">
                    {label}
                    {required ? (
                        <span
                            className="ml-1 text-destructive"
                            aria-hidden
                        >
                            *
                        </span>
                    ) : null}
                </Label>
                {!required && showOptionalHint ? (
                    <span className="text-xs text-muted-foreground">
                        optional
                    </span>
                ) : null}
                {required ? (
                    <span className="sr-only">required</span>
                ) : null}
            </div>
            {description ? (
                <p className="text-xs text-muted-foreground">{description}</p>
            ) : null}
            {children}
        </div>
    );
}
