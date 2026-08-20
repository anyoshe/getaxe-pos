"use client";

import {
    useEffect,
    useMemo,
    useState,
} from "react";

import type {
    UseFormReturn,
} from "react-hook-form";

import {
    productRuleResolver,
} from "../../../services/product-rule-resolver";

import type {
    ProductContext,
    ProductType,
} from "../../../types";

import type {
    ProductFormInput,
} from "../product-form.types";

export interface ProductWizardStep {
    id: string;
    title: string;
}

interface UseProductWizardOptions {
    productType: ProductType | null;
    businessCapabilities?: string[];
    form?: UseFormReturn<ProductFormInput>;
    onProductTypeChange: (type: ProductType) => void;
}

export function useProductWizard({
    productType,
    businessCapabilities = [],
    form,
    onProductTypeChange,
}: UseProductWizardOptions) {
    const [currentStep, setCurrentStep] = useState(0);

    const steps = useMemo(() => {
        if (!productType) {
            return [] as ProductWizardStep[];
        }

        const ruleSet = productRuleResolver.resolve({
            businessCapabilities,
            productType,
        });

        return ruleSet.steps.map((step) => ({
            id: step.id,
            title: step.title,
        }));
    }, [businessCapabilities, productType]);

    useEffect(() => {
        if (currentStep >= steps.length) {
            setCurrentStep(0);
        }
    }, [currentStep, steps.length]);

    function resolveStepFieldNames(stepId: string): string[] {
        if (!productType) {
            return [];
        }

        const ruleSet = productRuleResolver.resolve({
            businessCapabilities,
            productType,
        });

        return ruleSet.fields
            .filter((field) => field.step === stepId && field.required)
            .map((field) => field.key);
    }

    function selectProductType(type: ProductType) {
        onProductTypeChange(type);
        setCurrentStep(0);
    }

    function next() {
        if (!productType || !steps.length) {
            return;
        }

        const currentStepId = steps[currentStep]?.id;
        if (!currentStepId || !form) {
            setCurrentStep((step) => Math.min(step + 1, steps.length - 1));
            return;
        }

        const currentFields = resolveStepFieldNames(currentStepId);
        if (currentFields.length > 0) {
            form.trigger(currentFields as (keyof ProductFormInput)[]).then((valid) => {
                if (!valid) {
                    return;
                }

                setCurrentStep((step) => Math.min(step + 1, steps.length - 1));
            });
            return;
        }

        setCurrentStep((step) => Math.min(step + 1, steps.length - 1));
    }

    function previous() {
        setCurrentStep((step) => Math.max(step - 1, 0));
    }

    function goToStep(step: number) {
        if (step >= 0 && step < steps.length) {
            setCurrentStep(step);
        }
    }

    return {
        productType,
        currentStep,
        steps,
        selectProductType,
        next,
        previous,
        goToStep,
        hasProductType: productType !== null && steps.length > 0,
        isFirstStep: currentStep === 0,
        isLastStep: steps.length > 0 && currentStep === steps.length - 1,
    };
}