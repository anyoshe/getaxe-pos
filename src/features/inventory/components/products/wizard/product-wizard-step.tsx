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

type SectionProps = {
    form: UseFormReturn<ProductFormInput>;
    context: ProductContext;
    visibleFields?: string[];
    requiredFields?: string[];
};

/**
 * Map rule-definition step ids → section components.
 * Keep aliases so older ids (basic, accounting) still work.
 */
const STEP_COMPONENTS: Record<string, ComponentType<SectionProps>> = {
    "product-information": ProductBasic,
    basic: ProductBasic,
    classification: ProductClassification,
    units: ProductUnits,
    inventory: ProductInventory,
    "batch-expiry": ProductInventory,
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
        return (
            <p className="text-sm text-muted-foreground">
                No form section is configured for step “{stepId}”.
            </p>
        );
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

    // Required from full rule set (not only this step), so * stays accurate
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
