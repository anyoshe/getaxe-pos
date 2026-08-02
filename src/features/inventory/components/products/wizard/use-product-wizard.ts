"use client";

import { useMemo, useState } from "react";
import { PRODUCT_WIZARD_STEPS } from "./product-wizard.config";


export type ProductType =
    | "physical"
    | "service"
    | "medicine"
    | "raw-material"
    | "finished-product";

export interface ProductWizardStep {
    id: string;
    title: string;
}

export function useProductWizard() {
    const [productType, setProductType] =
        useState<ProductType | null>(null);

    const [currentStep, setCurrentStep] =
        useState(0);

    const steps = useMemo(() => {

    if (!productType) {
        return [];
    }

    return PRODUCT_WIZARD_STEPS.filter(
        (step) =>
            step.productTypes.includes(
                productType,
            ),
    );

}, [productType]);
    
    function selectProductType(
        type: ProductType,
    ) {
        setProductType(type);
        setCurrentStep(0);
    }

    function next() {
        setCurrentStep((step) =>
            Math.min(
                step + 1,
                steps.length - 1,
            ),
        );
    }

    function previous() {
        setCurrentStep((step) =>
            Math.max(step - 1, 0),
        );
    }

    function goToStep(
        step: number,
    ) {
        if (
            step >= 0 &&
            step < steps.length
        ) {
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
        hasProductType:
            productType !== null,
        isFirstStep:
            currentStep === 0,
        isLastStep:
            currentStep ===
            steps.length - 1,
    };
}