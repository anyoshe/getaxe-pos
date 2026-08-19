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
    ProductUnits,
    ProductInventory,
    ProductFinance,
} from "../sections";

import type {
    ProductType,
} from "../../../types/products";

export interface ProductWizardStepDefinition {

    id: string;

    title: string;

    productTypes: ProductType[];

    component: ComponentType<{
        form: UseFormReturn<ProductFormInput>;
        context: ProductContext;
    }>;

}

export const PRODUCT_WIZARD_STEPS: ProductWizardStepDefinition[] = [

    {
        id: "basic",

        title: "Basic Information",

        productTypes: [
            "physical",
            "medicine",
            "service",
            "raw-material",
            "finished-product",
        ],

        component: ProductBasic,
    },

    {
        id: "classification",

        title: "Classification",

        productTypes: [
            "physical",
            "medicine",
            "service",
            "raw-material",
            "finished-product",
        ],

        component:
            ProductClassification,
    },

    {
        id: "units",

        title: "Units & Measurements",

        productTypes: [
            "physical",
            "medicine",
            "raw-material",
            "finished-product",
        ],

        component:
            ProductUnits,
    },

    {
        id: "inventory",

        title: "Inventory",

        productTypes: [
            "physical",
            "medicine",
            "raw-material",
            "finished-product",
        ],

        component:
            ProductInventory,
    },

    {
        id: "finance",

        title: "Pricing & Finance",

        productTypes: [
            "physical",
            "medicine",
            "service",
            "raw-material",
            "finished-product",
        ],

        component:
            ProductFinance,
    },

];