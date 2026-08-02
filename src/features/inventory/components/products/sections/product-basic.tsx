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

}

export function ProductBasic({
    form,
}: ProductBasicProps) {

    return (

        <FormSection
            title="Basic Information"
            description="General product information."
        >

            <div className="grid gap-4 md:grid-cols-2">

                <FormTextField
                    form={form}
                    name="name"
                    label="Product Name"
                />

                <FormTextField
                    form={form}
                    name="genericName"
                    label="Generic Name"
                />

                <FormTextField
                    form={form}
                    name="productBrand"
                    label="Brand"
                />

                <FormTextField
                    form={form}
                    name="sku"
                    label="SKU"
                />

                <FormTextField
                    form={form}
                    name="barcode"
                    label="Barcode"
                />

                <FormTextField
                    form={form}
                    name="packSize"
                    label="Pack Size"
                />

                <FormNumberField
                    form={form}
                    name="costPrice"
                    label="Cost Price"
                    step="0.01"
                />

            </div>

            <FormTextarea
                form={form}
                name="description"
                label="Description"
                rows={4}
            />

        </FormSection>

    );

}