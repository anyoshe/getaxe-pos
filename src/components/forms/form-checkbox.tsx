"use client";

import {
    Controller,
    type Control,
    type FieldPath,
    type FieldValues,
} from "react-hook-form";

import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

interface FormCheckboxProps<TFieldValues extends FieldValues> {
    control: Control<TFieldValues>;
    name: FieldPath<TFieldValues>;
    label: string;
    description?: string;
    disabled?: boolean;
    className?: string;
}

export function FormCheckbox<TFieldValues extends FieldValues>({
    control,
    name,
    label,
    description,
    disabled,
    className,
}: FormCheckboxProps<TFieldValues>) {
    return (
        <Controller
            control={control}
            name={name}
            render={({ field }) => (
                <label
                    className={cn(
                        "flex cursor-pointer items-start gap-3 rounded-xl border border-border/80 bg-card p-3.5 transition-colors",
                        "hover:border-primary/40 hover:bg-muted/30",
                        field.value && "border-primary/50 bg-primary/5",
                        disabled && "cursor-not-allowed opacity-50",
                        className,
                    )}
                >
                    <Checkbox
                        className="mt-0.5"
                        checked={!!field.value}
                        disabled={disabled}
                        onCheckedChange={(checked) =>
                            field.onChange(Boolean(checked))
                        }
                    />
                    <span className="min-w-0 space-y-0.5">
                        <span className="block text-sm font-medium leading-snug">
                            {label}
                        </span>
                        {description ? (
                            <span className="block text-xs leading-relaxed text-muted-foreground">
                                {description}
                            </span>
                        ) : null}
                    </span>
                </label>
            )}
        />
    );
}
