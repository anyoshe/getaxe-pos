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
    Input,
} from "@/components/ui/input";

interface FormNumberFieldProps<
    TFieldValues extends FieldValues,
> {
    form: UseFormReturn<TFieldValues>;

    name: FieldPath<TFieldValues>;

    label: string;

    placeholder?: string;

    step?: number | string;

    min?: number;

    max?: number;

    disabled?: boolean;
}

export function FormNumberField<
    TFieldValues extends FieldValues,
>({
    form,
    name,
    label,
    placeholder,
    step = 1,
    min,
    max,
    disabled,
}: FormNumberFieldProps<TFieldValues>) {

    return (

        <FormField label={label}>

            <Input
                type="number"
                placeholder={placeholder}
                step={step}
                min={min}
                max={max}
                disabled={disabled}
                {...form.register(name, {
                    valueAsNumber: true,
                })}
            />

        </FormField>

    );

}