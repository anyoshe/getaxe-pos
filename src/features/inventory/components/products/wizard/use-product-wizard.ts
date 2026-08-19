"use client";

import {
    useMemo,
    useState,
} from "react";

import {
    PRODUCT_WIZARD_STEPS,
} from "./product-wizard.config";

import type {
    ProductType,
} from "../../../types/products";

export interface ProductWizardStep {
    id: string;
    title: string;
}

interface UseProductWizardOptions {

    productType: ProductType | null;

    onProductTypeChange: (
        type: ProductType
    ) => void;

}

export function useProductWizard({
    productType,
    onProductTypeChange,
}: UseProductWizardOptions) {

    const [
        currentStep,
        setCurrentStep,
    ] = useState(0);

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

        onProductTypeChange(type);

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
            Math.max(
                step - 1,
                0,
            ),
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
    productType !== null &&
    steps.length > 0,

        isFirstStep:
            currentStep === 0,

        isLastStep:
            steps.length > 0 &&
            currentStep === steps.length - 1,

    };
}