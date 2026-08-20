"use client";

import type { ComponentType } from "react";
import type { UseFormReturn } from "react-hook-form";

import type { ProductContext } from "../../../types";
import type { ProductFormInput } from "../product-form.types";

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

const STEP_COMPONENTS: Record<
    string,
    ComponentType<{
        form: UseFormReturn<ProductFormInput>;
        context: ProductContext;
        visibleFields?: string[];
        requiredFields?: string[];
    }>
> = {
    basic: ProductBasic,
    classification: ProductClassification,
    units: ProductUnits,
    inventory: ProductInventory,
    pricing: ProductFinance,
    accounting: ProductFinance,
    pharmacy: ProductClassification,
};

export function ProductWizardStep({
    stepId,
    form,
    context,
}: ProductWizardStepProps) {
    const Component = STEP_COMPONENTS[stepId];

    if (!Component) {
        return null;
    }

    const productType = form.getValues("productType");
    const ruleSet = productType
        ? productRuleResolver.resolve({
              businessCapabilities: context.businessCapabilities,
              productType,
          })
        : null;

    const visibleFields = ruleSet
        ? ruleSet.fields
              .filter((field) => field.step === stepId)
              .map((field) => field.key)
        : [];

    const requiredFields = ruleSet?.requiredFields ?? [];

    return (
        <Component
            form={form}
            context={context}
            visibleFields={visibleFields}
            requiredFields={requiredFields}
        />
    );
}
