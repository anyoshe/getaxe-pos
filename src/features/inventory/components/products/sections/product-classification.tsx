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
    requiredFields?: string[];
}

export function ProductClassification({
    form,
    context,
    visibleFields,
    requiredFields,
}: ProductClassificationProps) {
    const visibleSet = new Set(visibleFields ?? []);
    const requiredSet = new Set(requiredFields ?? []);
    const isRequired = (field: string) => requiredSet.has(field);
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
                        label="Category"
                        placeholder="Select category"
                    
                        required={isRequired("categoryId")}
                    />
                )}

                {showField("supplierId") && (
                    <FormSearchableSelect
                        control={form.control}
                        name="supplierId"
                        options={context.suppliers}
                        label="Supplier"
                        placeholder="Select supplier"
                    
                        required={isRequired("supplierId")}
                    />
                )}

                {showField("manufacturerId") && (
                    <FormSearchableSelect
                        control={form.control}
                        name="manufacturerId"
                        options={context.manufacturers}
                        label="Manufacturer"
                        placeholder="Select manufacturer"
                    
                        required={isRequired("manufacturerId")}
                    />
                )}

                {showField("drugCategoryId") && (
                    <FormSearchableSelect
                        control={form.control}
                        name="drugCategoryId"
                        options={context.drugCategories}
                        label="Drug category"
                        placeholder="Select drug category"
                    
                        required={isRequired("drugCategoryId")}
                    />
                )}

                {showField("dosageFormId") && (
                    <FormSearchableSelect
                        control={form.control}
                        name="dosageFormId"
                        options={context.dosageForms}
                        label="Dosage form"
                        placeholder="Select dosage form"
                    
                        required={isRequired("dosageFormId")}
                    />
                )}

                {showField("drugStrengthId") && (
                    <FormSearchableSelect
                        control={form.control}
                        name="drugStrengthId"
                        options={context.drugStrengths}
                        label="Drug strength"
                        placeholder="Select drug strength"
                    
                        required={isRequired("drugStrengthId")}
                    />
                )}

                {showField("prescriptionTypeId") && (
                    <FormSearchableSelect
                        control={form.control}
                        name="prescriptionTypeId"
                        options={context.prescriptionTypes}
                        label="Prescription type"
                        placeholder="Select prescription type"
                    
                        required={isRequired("prescriptionTypeId")}
                    />
                )}

            </div>

        </FormSection>

    );

}