"use client";

import {
    Controller,
    type Control,
    type FieldPath,
    type FieldValues,
} from "react-hook-form";

import { FormField } from "./form-field";
import { SearchableSelect } from "./searchable-select";

interface FormSearchableSelectProps<
    TFieldValues extends FieldValues,
    TOption,
> {
    control: Control<TFieldValues>;
    name: FieldPath<TFieldValues>;
    options: TOption[];
    label?: string;
    placeholder: string;
    required?: boolean;
    description?: string;
    getValue?: (option: TOption) => string;
    getLabel?: (option: TOption) => string;
}

export function FormSearchableSelect<
    TFieldValues extends FieldValues,
    TOption extends { id: string },
>({
    control,
    name,
    options,
    label,
    placeholder,
    required = false,
    description,
    getValue = (option) => option.id,
    getLabel = (option) =>
        (option as { name?: string }).name ?? option.id,
}: FormSearchableSelectProps<TFieldValues, TOption>) {
    const fieldLabel =
        label ??
        (placeholder.replace(/^(Select|Choose)\s+/i, "") || String(name));

    return (
        <Controller
            control={control}
            name={name}
            render={({ field }) => (
                <FormField
                    label={fieldLabel}
                    required={required}
                    description={description}
                >
                    <SearchableSelect
                        options={options}
                        value={field.value ?? null}
                        onChange={field.onChange}
                        placeholder={placeholder}
                        getValue={getValue}
                        getLabel={getLabel}
                    />
                </FormField>
            )}
        />
    );
}
