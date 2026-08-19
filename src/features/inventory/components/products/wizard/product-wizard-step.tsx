"use client";

import type {
    ComponentType,
} from "react";

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
    ProductBasic,
    ProductClassification,
    ProductFinance,
    ProductInventory,
    ProductUnits,
} from "../sections";

import { productRuleResolver } from "../../../services/product-rule-resolver";

interface ProductWizardStepProps {
    stepId: string;
    form: UseFormReturn<ProductFormInput>;
    context: ProductContext;
}

function resolveStepComponent(stepId: string): ComponentType<any> | null {
    const stepComponentMap: Record<string, ComponentType<any>> = {
        "product-information": ProductBasic,
        classification: ProductClassification,
        units: ProductUnits,
        inventory: ProductInventory,
        pricing: ProductFinance,
        accounting: ProductFinance,
        "batch-expiry": ProductInventory,
        pharmacy: ProductClassification,
    };

    return stepComponentMap[stepId] ?? null;
}

export function ProductWizardStep({
    stepId,
    form,
    context,
}: ProductWizardStepProps) {
    const Component = resolveStepComponent(stepId);

    if (!Component) {
        return null;
    }

    const productType = form.getValues("productType");
    const visibleFields = productType
        ? productRuleResolver
            .resolve({
                businessCapabilities: context.businessCapabilities,
                productType,
            })
            .fields.filter((field) => field.step === stepId)
            .map((field) => field.key)
        : [];

    return (
        <Component
            form={form}
            context={context}
            visibleFields={visibleFields}
        />
    );
}