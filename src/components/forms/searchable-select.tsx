"use client";

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

const NONE_VALUE = "__none__";

interface SearchableSelectProps<T> {
    options: T[];
    value?: string | null;
    onChange: (value: string | null) => void;
    getValue: (option: T) => string;
    getLabel: (option: T) => string;
    placeholder?: string;
}

/**
 * Always-controlled select for nullable form fields.
 * Avoids Base UI uncontrolled→controlled warning when value starts as null.
 */
export function SearchableSelect<T>({
    options,
    value,
    onChange,
    getValue,
    getLabel,
    placeholder = "Select option",
}: SearchableSelectProps<T>) {
    const controlledValue =
        value && value.length > 0 ? value : NONE_VALUE;

    return (
        <Select
            value={controlledValue}
            onValueChange={(next) => {
                if (!next || next === NONE_VALUE) {
                    onChange(null);
                    return;
                }
                onChange(next);
            }}
        >
            <SelectTrigger className="w-full">
                <SelectValue placeholder={placeholder} />
            </SelectTrigger>

            <SelectContent>
                <SelectItem value={NONE_VALUE}>
                    {placeholder}
                </SelectItem>
                {options.map((option) => {
                    const optionValue = getValue(option);
                    if (!optionValue || optionValue === NONE_VALUE) {
                        return null;
                    }
                    return (
                        <SelectItem
                            key={optionValue}
                            value={optionValue}
                        >
                            {getLabel(option)}
                        </SelectItem>
                    );
                })}
            </SelectContent>
        </Select>
    );
}
