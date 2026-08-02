"use client";
import { z } from "zod";
import {
    useEffect,
    useTransition,
} from "react";

import {
    useForm,
} from "react-hook-form";

import {
    zodResolver,
} from "@hookform/resolvers/zod";

import {
    toast,
} from "sonner";


import type {
    ProductFormProps,
} from "./product-form.types";

import {
    productFormSchema,
} from "./product-form.types";

import {
    createProductAction,
    updateProductAction,
} from "../../actions";

type ProductFormInput =
    z.infer<typeof productFormSchema>;

import type {
    Product,
} from "../../types";


function getProductDefaultValues(
    product?: Product | null
): ProductFormInput {

    return {

        categoryId:
            product?.categoryId ?? "",

        supplierId:
            product?.supplierId ?? null,

        manufacturerId:
            product?.manufacturerId ?? null,

        drugCategoryId:
            product?.drugCategoryId ?? null,

        dosageFormId:
            product?.dosageFormId ?? null,

        drugStrengthId:
            product?.drugStrengthId ?? null,

        prescriptionTypeId:
            product?.prescriptionTypeId ?? null,

        purchaseUnitId:
            product?.purchaseUnitId ?? null,

        salesUnitId:
            product?.salesUnitId ?? null,

        stockUnitId:
            product?.stockUnitId ?? null,

        incomeAccountId:
            product?.incomeAccountId ?? null,

        expenseAccountId:
            product?.expenseAccountId ?? null,

        inventoryAccountId:
            product?.inventoryAccountId ?? null,

        taxRateId:
            product?.taxRateId ?? null,

        name:
            product?.name ?? "",

        genericName:
            product?.genericName ?? null,

        productBrand:
            product?.productBrand ?? null,

        description:
            product?.description ?? null,

        sku:
            product?.sku ?? null,

        barcode:
            product?.barcode ?? null,

        packSize:
            product?.packSize ?? null,

        costPrice:
            product?.costPrice ?? null,

        minimumStock:
            product?.minimumStock ?? 0,

        reorderLevel:
            product?.reorderLevel ?? 0,

        trackInventory:
            product?.trackInventory ?? true,

        trackBatch:
            product?.trackBatch ?? false,

        trackExpiry:
            product?.trackExpiry ?? false,

        serialized:
            product?.serialized ?? false,

        allowNegativeStock:
            product?.allowNegativeStock ?? false,

        active:
            product?.active ?? true,
    };
}


import { ProductWizard } from "./product-wizard";

import { useProductWizard } from "./wizard/use-product-wizard";

export function ProductForm({
    product,
    context,
    onSuccess,
}: ProductFormProps) {

    const [pending, startTransition] =
        useTransition();

    const form =
        useForm<ProductFormInput>({
            resolver: zodResolver(productFormSchema),


            defaultValues:
                getProductDefaultValues(product),
        });

    const wizard = useProductWizard();

    useEffect(() => {

        form.reset(
            getProductDefaultValues(product)
        );

    }, [product, form]);

    async function onSubmit(
        values: ProductFormInput
    ) {

        startTransition(async () => {

            const formData = new FormData();

            Object.entries(values).forEach(
                ([key, value]) => {

                    if (
                        value === null ||
                        value === undefined
                    ) {
                        return;
                    }

                    formData.append(
                        key,
                        String(value)
                    );

                }
            );

            const result =
                product
                    ? await updateProductAction(
                        product.id,
                        formData
                    )
                    : await createProductAction(
                        formData
                    );

            if (!result.success) {

                toast.error(
                    result.message ??
                    "Unable to save product."
                );

                return;

            }

            toast.success(
                result.message
            );

            onSuccess?.();

        });

    }
    return (

        <form
            onSubmit={
                form.handleSubmit(onSubmit)
            }
            className="space-y-6"
        >

            <ProductWizard
                wizard={wizard}
                form={form}
                context={context}
                pending={pending}
                onSubmit={form.handleSubmit(onSubmit)}
            />
        </form>

    );

}