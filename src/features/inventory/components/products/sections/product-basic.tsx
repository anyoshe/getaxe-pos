"use client";

import type {
    UseFormReturn,
} from "react-hook-form";

import {
    FormSection,
    FormTextField,
    FormNumberField,
    FormTextarea,
} from "@/components/forms";

import type {
    ProductFormInput,
} from "../product-form.types";

interface ProductBasicProps {
    form: UseFormReturn<ProductFormInput>;
    visibleFields?: string[];
}

export function ProductBasic({
    form,
    visibleFields,
}: ProductBasicProps) {
    const visibleSet = new Set(visibleFields ?? []);
    const showField = (field: string) => visibleFields === undefined || visibleSet.has(field);

    return (

        <FormSection
            title="Basic Information"
            description="General product information."
        >

            <div className="grid gap-4 md:grid-cols-2">

                {showField("name") && (
                    <FormTextField
                        form={form}
                        name="name"
                        label="Product Name"
                    />
                )}

                {showField("genericName") && (
                    <FormTextField
                        form={form}
                        name="genericName"
                        label="Generic Name"
                    />
                )}

                {showField("productBrand") && (
                    <FormTextField
                        form={form}
                        name="productBrand"
                        label="Brand"
                    />
                )}

                {showField("sku") && (
                    <FormTextField
                        form={form}
                        name="sku"
                        label="SKU"
                    />
                )}

                {showField("barcode") && (
                    <FormTextField
                        form={form}
                        name="barcode"
                        label="Barcode"
                    />
                )}

                {showField("packSize") && (
                    <FormTextField
                        form={form}
                        name="packSize"
                        label="Pack Size"
                    />
                )}

                {showField("costPrice") && (
                    <FormNumberField
                        form={form}
                        name="costPrice"
                        label="Cost Price"
                        step="0.01"
                    />
                )}

            </div>

            {showField("description") && (
                <FormTextarea
                    form={form}
                    name="description"
                    label="Description"
                    rows={4}
                />
            )}

        </FormSection>

    );

}