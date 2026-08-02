"use client";

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

interface SearchableSelectProps<T> {

    options: T[];

    value?: string | null;

    onChange: (
        value: string | null
    ) => void;

    getValue: (
        option: T
    ) => string;

    getLabel: (
        option: T
    ) => string;

    placeholder?: string;

}

export function SearchableSelect<T>({
    options,
    value,
    onChange,
    getValue,
    getLabel,
    placeholder = "Select option",
}: SearchableSelectProps<T>) {

    return (


        <Select
            value={value ?? undefined}
            onValueChange={(v) => {
                console.log("Selected:", v);
                onChange(v);
            }}
        >
            <SelectTrigger
                className="w-full"
            >

                <SelectValue
                    placeholder={placeholder}
                />

            </SelectTrigger>

            <SelectContent>

                {
                    options.map((option) => (

                        <SelectItem
                            key={getValue(option)}
                            value={getValue(option)}
                        >

                            {getLabel(option)}

                        </SelectItem>

                    ))
                }

            </SelectContent>

        </Select>

    );

}