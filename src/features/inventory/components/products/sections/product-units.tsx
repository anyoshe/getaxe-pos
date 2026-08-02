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

}

export function ProductUnits({
    form,
    context,
}: ProductUnitsProps) {

    return (

        <FormSection
            title="Units of Measure"
            description="Configure purchase, sales and stock units."
        >

            <div className="grid gap-4 md:grid-cols-3">

                <FormSearchableSelect
                    control={form.control}
                    name="purchaseUnitId"
                    options={context.units}
                    placeholder="Purchase Unit"
                />

                <FormSearchableSelect
                    control={form.control}
                    name="salesUnitId"
                    options={context.units}
                    placeholder="Sales Unit"
                />

                <FormSearchableSelect
                    control={form.control}
                    name="stockUnitId"
                    options={context.units}
                    placeholder="Stock Unit"
                />

            </div>

        </FormSection>

    );

}