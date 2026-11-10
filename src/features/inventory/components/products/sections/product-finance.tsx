"use client";

import type { UseFormReturn } from "react-hook-form";

import {
    FormSection,
    FormSearchableSelect,
    FormNumberField,
} from "@/components/forms";

import type { ProductContext } from "../../../types";
import type { ProductFormInput } from "../product-form.types";

interface ProductFinanceProps {
    form: UseFormReturn<ProductFormInput>;
    context: ProductContext;
    visibleFields?: string[];
    requiredFields?: string[];
}

/**
 * Pricing only — GL accounts use business defaults (nullable on product).
 * Keeps create/edit fast without dropping cost or shelf price.
 */
export function ProductFinance({
    form,
    context,
    visibleFields,
    requiredFields,
}: ProductFinanceProps) {
    const visibleSet = new Set(visibleFields ?? []);
    const requiredSet = new Set(requiredFields ?? []);
    const isRequired = (field: string) => requiredSet.has(field);
    const showField = (field: string) =>
        visibleFields === undefined || visibleSet.has(field);

    const showSellingPrice =
        visibleFields === undefined ||
        visibleSet.has("costPrice") ||
        visibleSet.has("sellingPrice");

    const showTax =
        showField("taxRateId") && (context.taxRates?.length ?? 0) > 0;

    return (
        <FormSection
            title="Pricing"
            description="Cost and optional shelf price. Ledger accounts follow business defaults — set per product later only if needed."
        >
            <div className="grid gap-4 md:grid-cols-2">
                {showField("costPrice") && (
                    <FormNumberField
                        form={form}
                        name="costPrice"
                        label="Cost Price"
                        step="0.01"
                        required={isRequired("costPrice")}
                    />
                )}

                {showSellingPrice && (
                    <FormNumberField
                        form={form}
                        name="sellingPrice"
                        label="Default Selling Price"
                        step="0.01"
                        required={false}
                        description="Creates a price on the default price list when set"
                    />
                )}

                {showTax && (
                    <FormSearchableSelect
                        control={form.control}
                        name="taxRateId"
                        options={context.taxRates}
                        placeholder="Tax Rate (optional)"
                        getLabel={(tax) =>
                            `${tax.name}${
                                tax.rate !== null ? ` (${tax.rate}%)` : ""
                            }`
                        }
                        required={isRequired("taxRateId")}
                    />
                )}
            </div>
        </FormSection>
    );
}
