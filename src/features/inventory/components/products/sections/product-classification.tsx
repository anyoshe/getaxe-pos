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
    visibleFields?: string[];
}

export function ProductClassification({
    form,
    context,
    visibleFields,
}: ProductClassificationProps) {
    const visibleSet = new Set(visibleFields ?? []);
    const showField = (field: string) => visibleFields === undefined || visibleSet.has(field);

    return (

        <FormSection
            title="Classification"
            description="Product classification and pharmaceutical information."
        >

            <div className="grid gap-4 md:grid-cols-2">

                {showField("categoryId") && (
                    <FormSearchableSelect
                        control={form.control}
                        name="categoryId"
                        options={context.categories}
                        placeholder="Select Category"
                    />
                )}

                {showField("supplierId") && (
                    <FormSearchableSelect
                        control={form.control}
                        name="supplierId"
                        options={context.suppliers}
                        placeholder="Select Supplier"
                    />
                )}

                {showField("manufacturerId") && (
                    <FormSearchableSelect
                        control={form.control}
                        name="manufacturerId"
                        options={context.manufacturers}
                        placeholder="Select Manufacturer"
                    />
                )}

                {showField("drugCategoryId") && (
                    <FormSearchableSelect
                        control={form.control}
                        name="drugCategoryId"
                        options={context.drugCategories}
                        placeholder="Select Drug Category"
                    />
                )}

                {showField("dosageFormId") && (
                    <FormSearchableSelect
                        control={form.control}
                        name="dosageFormId"
                        options={context.dosageForms}
                        placeholder="Select Dosage Form"
                    />
                )}

                {showField("drugStrengthId") && (
                    <FormSearchableSelect
                        control={form.control}
                        name="drugStrengthId"
                        options={context.drugStrengths}
                        placeholder="Select Drug Strength"
                    />
                )}

                {showField("prescriptionTypeId") && (
                    <FormSearchableSelect
                        control={form.control}
                        name="prescriptionTypeId"
                        options={context.prescriptionTypes}
                        placeholder="Select Prescription Type"
                    />
                )}

            </div>

        </FormSection>

    );

}