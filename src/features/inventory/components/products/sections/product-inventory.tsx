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
    visibleFields?: string[];
    requiredFields?: string[];
}

export function ProductInventory({
    form,
    visibleFields,
    requiredFields,
}: ProductInventoryProps) {
    const visibleSet = new Set(visibleFields ?? []);
    const requiredSet = new Set(requiredFields ?? []);
    const isRequired = (field: string) => requiredSet.has(field);
    const showField = (field: string) => visibleFields === undefined || visibleSet.has(field);

    return (

        <FormSection
            title="Inventory Settings"
            description="Inventory tracking and stock control."
        >

            <div className="grid gap-4 md:grid-cols-2">

                {showField("minimumStock") && (
                    <FormNumberField
                        form={form}
                        name="minimumStock"
                        label="Minimum Stock"
                    />
                )}

                {showField("reorderLevel") && (
                    <FormNumberField
                        form={form}
                        name="reorderLevel"
                        label="Reorder Level"
                    />
                )}

            </div>

            <div className="grid gap-4 md:grid-cols-2">

                {showField("trackInventory") && (
                    <FormCheckbox
                        control={form.control}
                        name="trackInventory"
                        label="Track Inventory"
                    />
                )}

                {showField("trackBatch") && (
                    <FormCheckbox
                        control={form.control}
                        name="trackBatch"
                        label="Track Batch"
                    />
                )}

                {showField("trackExpiry") && (
                    <FormCheckbox
                        control={form.control}
                        name="trackExpiry"
                        label="Track Expiry"
                    />
                )}

                {showField("serialized") && (
                    <FormCheckbox
                        control={form.control}
                        name="serialized"
                        label="Serialized"
                    />
                )}

                {showField("allowNegativeStock") && (
                    <FormCheckbox
                        control={form.control}
                        name="allowNegativeStock"
                        label="Allow Negative Stock"
                    />
                )}

                {showField("active") && (
                    <FormCheckbox
                        control={form.control}
                        name="active"
                        label="Active"
                    />
                )}

            </div>

        </FormSection>

    );

}