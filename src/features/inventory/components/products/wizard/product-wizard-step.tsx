"use client";

import type { ComponentType } from "react";
import type { UseFormReturn } from "react-hook-form";

import type { ProductContext, ProductType } from "../../../types";
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
    /** Prefer wizard state so rules resolve even if form productType lags. */
    productType?: ProductType | null;
}

type SectionProps = {
    form: UseFormReturn<ProductFormInput>;
    context: ProductContext;
    visibleFields?: string[];
    requiredFields?: string[];
};

const STEP_COMPONENTS: Record<string, ComponentType<SectionProps>> = {
    "product-information": ProductBasic,
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
    productType: productTypeProp,
}: ProductWizardStepProps) {
    const Component = STEP_COMPONENTS[stepId];

    if (!Component) {
        return (
            <p className="text-sm text-muted-foreground">
                No form section is configured for step “{stepId}”.
            </p>
        );
    }

    // Watch so visibleFields recompute when type is set; prefer explicit wizard prop
    const watchedType = form.watch("productType") as ProductType | null | undefined;
    const productType = (productTypeProp ?? watchedType ?? null) as ProductType | null;

    const ruleSet =
        productType != null
            ? productRuleResolver.resolve({
                  businessCapabilities: context.businessCapabilities ?? [],
                  productType,
              })
            : null;

    // Fields for THIS step only — includes `serialized` when rules say so
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
