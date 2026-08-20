"use client";

import type {
    FieldPath,
    FieldValues,
    UseFormReturn,
} from "react-hook-form";

import { FormField } from "./form-field";
import { Input } from "@/components/ui/input";

interface FormNumberFieldProps<TFieldValues extends FieldValues> {
    form: UseFormReturn<TFieldValues>;
    name: FieldPath<TFieldValues>;
    label: string;
    placeholder?: string;
    step?: number | string;
    min?: number;
    max?: number;
    disabled?: boolean;
    required?: boolean;
    description?: string;
}

export function FormNumberField<TFieldValues extends FieldValues>({
    form,
    name,
    label,
    placeholder,
    step = 1,
    min,
    max,
    disabled,
    required = false,
    description,
}: FormNumberFieldProps<TFieldValues>) {
    return (
        <FormField
            label={label}
            required={required}
            description={description}
        >
            <Input
                type="number"
                placeholder={placeholder}
                step={step}
                min={min}
                max={max}
                disabled={disabled}
                aria-required={required}
                {...form.register(name, { valueAsNumber: true })}
            />
        </FormField>
    );
}
