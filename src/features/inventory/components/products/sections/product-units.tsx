"use client";

import type {
    UseFormReturn,
} from "react-hook-form";

import {
    FormSection,
    FormSearchableSelect,
} from "@/components/forms";

import type {
    ProductContext,
} from "../../../types";

import type {
    ProductFormInput,
} from "../product-form.types";

interface ProductUnitsProps {
    form: UseFormReturn<ProductFormInput>;
    context: ProductContext;
    visibleFields?: string[];
}

export function ProductUnits({
    form,
    context,
    visibleFields,
}: ProductUnitsProps) {
    const visibleSet = new Set(visibleFields ?? []);
    const showField = (field: string) => visibleFields === undefined || visibleSet.has(field);

    return (

        <FormSection
            title="Units of Measure"
            description="Configure purchase, sales and stock units."
        >

            <div className="grid gap-4 md:grid-cols-3">

                {showField("purchaseUnitId") && (
                    <FormSearchableSelect
                        control={form.control}
                        name="purchaseUnitId"
                        options={context.units}
                        placeholder="Purchase Unit"
                    />
                )}

                {showField("salesUnitId") && (
                    <FormSearchableSelect
                        control={form.control}
                        name="salesUnitId"
                        options={context.units}
                        placeholder="Sales Unit"
                    />
                )}

                {showField("stockUnitId") && (
                    <FormSearchableSelect
                        control={form.control}
                        name="stockUnitId"
                        options={context.units}
                        placeholder="Stock Unit"
                    />
                )}

            </div>

        </FormSection>

    );

}