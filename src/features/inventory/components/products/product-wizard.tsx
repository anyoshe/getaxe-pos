"use client";

import type { UseFormReturn } from "react-hook-form";

import type { ProductContext } from "../../types";
import type { ProductFormInput } from "./product-form.types";
import type { useProductWizard } from "./wizard/use-product-wizard";

import { ProductTypeSelector } from "./wizard/product-type-selector";
import { ProductWizardHeader } from "./wizard/product-wizard-header";
import { ProductWizardNavigation } from "./wizard/product-wizard-navigation";
import { ProductWizardStep } from "./wizard/product-wizard-step";

type ProductWizardState = ReturnType<typeof useProductWizard>;

interface ProductWizardProps {
    wizard: ProductWizardState;
    form: UseFormReturn<ProductFormInput>;
    context: ProductContext;
    pending: boolean;
    onSubmit: () => void;
}

const TYPE_LABELS: Record<string, string> = {
    physical: "Physical",
    service: "Service",
    medicine: "Medicine",
    "raw-material": "Raw material",
    "finished-product": "Finished product",
};

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
                businessCapabilities={context.businessCapabilities ?? []}
                onSelect={wizard.selectProductType}
            />
        );
    }

    const typeLabel = wizard.productType
        ? TYPE_LABELS[wizard.productType] ?? wizard.productType
        : undefined;

    return (
        <div className="space-y-6">
            <ProductWizardHeader
                steps={wizard.steps}
                currentStep={wizard.currentStep}
                productTypeLabel={typeLabel}
            />

            <div className="rounded-xl border border-border/60 bg-card/40 p-4 sm:p-5">
                <ProductWizardStep
                    stepId={wizard.steps[wizard.currentStep].id}
                    form={form}
                    context={context}
                />
            </div>

            <ProductWizardNavigation
                isFirstStep={wizard.isFirstStep}
                isLastStep={wizard.isLastStep}
                pending={pending}
                onBack={wizard.previous}
                onNext={wizard.next}
                onSave={onSubmit}
            />
        </div>
    );
}
