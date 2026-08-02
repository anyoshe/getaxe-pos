"use client";

import type {
    UseFormReturn,
} from "react-hook-form";

import {
    FormSection,
    FormCheckbox,
    FormNumberField,
} from "@/components/forms";

import type {
    ProductFormInput,
} from "../product-form.types";

interface ProductInventoryProps {

    form: UseFormReturn<ProductFormInput>;

}

export function ProductInventory({
    form,
}: ProductInventoryProps) {

    return (

        <FormSection
            title="Inventory Settings"
            description="Inventory tracking and stock control."
        >

            <div className="grid gap-4 md:grid-cols-2">

                <FormNumberField
                    form={form}
                    name="minimumStock"
                    label="Minimum Stock"
                />

                <FormNumberField
                    form={form}
                    name="reorderLevel"
                    label="Reorder Level"
                />

            </div>

            <div className="grid gap-4 md:grid-cols-2">

                <FormCheckbox
                    control={form.control}
                    name="trackInventory"
                    label="Track Inventory"
                />

                <FormCheckbox
                    control={form.control}
                    name="trackBatch"
                    label="Track Batch"
                />

                <FormCheckbox
                    control={form.control}
                    name="trackExpiry"
                    label="Track Expiry"
                />

                <FormCheckbox
                    control={form.control}
                    name="serialized"
                    label="Serialized"
                />

                <FormCheckbox
                    control={form.control}
                    name="allowNegativeStock"
                    label="Allow Negative Stock"
                />

                <FormCheckbox
                    control={form.control}
                    name="active"
                    label="Active"
                />

            </div>

        </FormSection>

    );

}