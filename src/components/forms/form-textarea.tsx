"use client";

import type {
    FieldPath,
    FieldValues,
    UseFormReturn,
} from "react-hook-form";

import {
    FormField,
} from "./form-field";

import {
    Textarea,
} from "@/components/ui/textarea";

interface FormTextareaProps<
    TFieldValues extends FieldValues,
> {

    form: UseFormReturn<TFieldValues>;

    name: FieldPath<TFieldValues>;

    label: string;

    placeholder?: string;

    rows?: number;

    disabled?: boolean;

}

export function FormTextarea<
    TFieldValues extends FieldValues,
>({
    form,
    name,
    label,
    placeholder,
    rows = 4,
    disabled,
}: FormTextareaProps<TFieldValues>) {

    return (

        <FormField label={label}>

            <Textarea
                rows={rows}
                placeholder={placeholder}
                disabled={disabled}
                {...form.register(name)}
            />

        </FormField>

    );

}