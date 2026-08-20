"use client";

import type {
    FieldPath,
    FieldValues,
    UseFormReturn,
} from "react-hook-form";

import { FormField } from "./form-field";
import { Input } from "@/components/ui/input";

interface FormTextFieldProps<TFieldValues extends FieldValues> {
    form: UseFormReturn<TFieldValues>;
    name: FieldPath<TFieldValues>;
    label: string;
    placeholder?: string;
    type?: React.HTMLInputTypeAttribute;
    disabled?: boolean;
    required?: boolean;
    description?: string;
}

export function FormTextField<TFieldValues extends FieldValues>({
    form,
    name,
    label,
    placeholder,
    type = "text",
    disabled,
    required = false,
    description,
}: FormTextFieldProps<TFieldValues>) {
    return (
        <FormField
            label={label}
            required={required}
            description={description}
        >
            <Input
                type={type}
                placeholder={placeholder}
                disabled={disabled}
                aria-required={required}
                {...form.register(name)}
            />
        </FormField>
    );
}
