"use client";

import {
    Controller,
    type Control,
    type FieldPath,
    type FieldValues,
} from "react-hook-form";

import {
    Checkbox,
} from "@/components/ui/checkbox";

interface FormCheckboxProps<
    TFieldValues extends FieldValues,
> {
    control: Control<TFieldValues>;

    name: FieldPath<TFieldValues>;

    label: string;

    disabled?: boolean;
}

export function FormCheckbox<
    TFieldValues extends FieldValues,
>({
    control,
    name,
    label,
    disabled,
}: FormCheckboxProps<TFieldValues>) {

    return (

        <Controller
            control={control}
            name={name}
            render={({ field }) => (

                <label className="flex items-center gap-3">

                    <Checkbox
                        checked={!!field.value}
                        disabled={disabled}
                        onCheckedChange={(checked) =>
                            field.onChange(Boolean(checked))
                        }
                    />

                    <span className="text-sm">
                        {label}
                    </span>

                </label>

            )}
        />

    );

}