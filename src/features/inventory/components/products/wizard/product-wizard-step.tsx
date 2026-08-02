"use client";

import type {
    UseFormReturn,
} from "react-hook-form";

import type {
    ProductContext,
} from "../../../types";

import type {
    ProductFormInput,
} from "../product-form.types";

import {
    PRODUCT_WIZARD_STEPS,
} from "./product-wizard.config";

interface ProductWizardStepProps {
    stepId: string;

    form: UseFormReturn<ProductFormInput>;

    context: ProductContext;
}

export function ProductWizardStep({
    stepId,
    form,
    context,
}: ProductWizardStepProps) {

    const step =
        PRODUCT_WIZARD_STEPS.find(
            (step) =>
                step.id === stepId,
        );

    if (!step) {
        return null;
    }

    const Component =
        step.component;

    return (
        <Component
            form={form}
            context={context}
        />
    );
}