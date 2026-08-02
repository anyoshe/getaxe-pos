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

interface ProductClassificationProps {

    form: UseFormReturn<ProductFormInput>;

    context: ProductContext;

}

export function ProductClassification({
    form,
    context,
}: ProductClassificationProps) {

    return (

        <FormSection
            title="Classification"
            description="Product classification and pharmaceutical information."
        >

            <div className="grid gap-4 md:grid-cols-2">

                <FormSearchableSelect
                    control={form.control}
                    name="categoryId"
                    options={context.categories}
                    placeholder="Select Category"
                />

                <FormSearchableSelect
                    control={form.control}
                    name="supplierId"
                    options={context.suppliers}
                    placeholder="Select Supplier"
                />

                <FormSearchableSelect
                    control={form.control}
                    name="manufacturerId"
                    options={context.manufacturers}
                    placeholder="Select Manufacturer"
                />

                <FormSearchableSelect
                    control={form.control}
                    name="drugCategoryId"
                    options={context.drugCategories}
                    placeholder="Select Drug Category"
                />

                <FormSearchableSelect
                    control={form.control}
                    name="dosageFormId"
                    options={context.dosageForms}
                    placeholder="Select Dosage Form"
                />

                <FormSearchableSelect
                    control={form.control}
                    name="drugStrengthId"
                    options={context.drugStrengths}
                    placeholder="Select Drug Strength"
                />

                <FormSearchableSelect
                    control={form.control}
                    name="prescriptionTypeId"
                    options={context.prescriptionTypes}
                    placeholder="Select Prescription Type"
                />

            </div>

        </FormSection>

    );

}