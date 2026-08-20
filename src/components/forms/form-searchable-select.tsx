"use client";

import {
    Controller,
    type Control,
    type FieldPath,
    type FieldValues,
} from "react-hook-form";

import {
    SearchableSelect,
} from "./searchable-select";

interface FormSearchableSelectProps<
    TFieldValues extends FieldValues,
    TOption,
> {
    control: Control<TFieldValues>;
    name: FieldPath<TFieldValues>;
    options: TOption[];
    placeholder: string;
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
    placeholder,
    getValue = (option) => option.id,
    getLabel = (option) =>
        (option as { name?: string }).name ?? option.id,
}: FormSearchableSelectProps<TFieldValues, TOption>) {
    return (
        <Controller
            control={control}
            name={name}
            render={({ field }) => (
                <SearchableSelect
                    options={options}
                    value={field.value ?? null}
                    onChange={field.onChange}
                    placeholder={placeholder}
                    getValue={getValue}
                    getLabel={getLabel}
                />
            )}
        />
    );
}
