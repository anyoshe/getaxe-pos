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
import type { PackagingLineDraft } from "../sections/product-packaging-editor";

interface ProductWizardStepProps {
    stepId: string;
    form: UseFormReturn<ProductFormInput>;
    context: ProductContext;
    productType?: ProductType | null;
    productId?: string | null;
    packagingDraft?: PackagingLineDraft[];
    onPackagingDraftChange?: (lines: PackagingLineDraft[]) => void;
}

type SectionProps = {
    form: UseFormReturn<ProductFormInput>;
    context: ProductContext;
    visibleFields?: string[];
    requiredFields?: string[];
    productId?: string | null;
    packagingDraft?: PackagingLineDraft[];
    onPackagingDraftChange?: (lines: PackagingLineDraft[]) => void;
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
    productId,
    packagingDraft,
    onPackagingDraftChange,
}: ProductWizardStepProps) {
    const Component = STEP_COMPONENTS[stepId];

    if (!Component) {
        return (
            <p className="text-sm text-muted-foreground">
                No form section is configured for step “{stepId}”.
            </p>
        );
    }

    const watchedType = form.watch("productType") as ProductType | null | undefined;
    const productType = (productTypeProp ?? watchedType ?? null) as ProductType | null;

    const ruleSet =
        productType != null
            ? productRuleResolver.resolve({
                  businessCapabilities: context.businessCapabilities ?? [],
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
            productId={productId}
            packagingDraft={packagingDraft}
            onPackagingDraftChange={onPackagingDraftChange}
        />
    );
}
