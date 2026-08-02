"use client";

import type {
    UseFormReturn,
} from "react-hook-form";

import type {
    ProductContext,
} from "../../types";

import type {
    ProductFormInput,
} from "./product-form.types";

import type {
    useProductWizard,
} from "./wizard/use-product-wizard";

import {
    ProductTypeSelector,
} from "./wizard/product-type-selector";

import {
    ProductWizardHeader,
} from "./wizard/product-wizard-header";

import {
    ProductWizardNavigation,
} from "./wizard/product-wizard-navigation";

import {
    ProductWizardStep,
} from "./wizard/product-wizard-step";

type ProductWizardState =
    ReturnType<typeof useProductWizard>;

interface ProductWizardProps {

    wizard: ProductWizardState;

    form: UseFormReturn<ProductFormInput>;

    context: ProductContext;

    pending: boolean;

    onSubmit: () => void;

}

export function ProductWizard({
    wizard,
    form,
    context,
    pending,
    onSubmit,
}: ProductWizardProps) {


    if (!wizard.hasProductType) {
        return (
            <ProductTypeSelector
                value={wizard.productType}
                onSelect={wizard.selectProductType}
            />
        );
    }

    return (
        <div className="space-y-6">
            <ProductWizardHeader
                steps={wizard.steps}
                currentStep={wizard.currentStep}
            />

            <ProductWizardStep
                stepId={
                    wizard.steps[
                        wizard.currentStep
                    ].id
                }
                form={form}
                context={context}
            />

            <ProductWizardNavigation
                isFirstStep={wizard.isFirstStep}
                isLastStep={wizard.isLastStep}
                onBack={wizard.previous}
                onNext={wizard.next}
                onSave={onSubmit}
            />
        </div>
    );
}