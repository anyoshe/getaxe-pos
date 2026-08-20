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
    /** Always controlled. null/undefined means no selection. */
    value?: string | null;
    onChange: (value: string | null) => void;
    getValue: (option: T) => string;
    getLabel: (option: T) => string;
    placeholder?: string;
}

/**
 * Controlled select that always shows a human label (never raw UUID or __none__).
 */
export function SearchableSelect<T>({
    options,
    value,
    onChange,
    getValue,
    getLabel,
    placeholder = "Select option",
}: SearchableSelectProps<T>) {
    const selected = value
        ? options.find((option) => getValue(option) === value)
        : undefined;

    const displayLabel = selected
        ? getLabel(selected)
        : placeholder;

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
                {/* Explicit text so Base UI never renders the raw value/UUID */}
                <SelectValue placeholder={placeholder}>
                    {displayLabel}
                </SelectValue>
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
