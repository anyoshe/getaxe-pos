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
}

export function ProductFinance({
    form,
    context,
    visibleFields,
}: ProductFinanceProps) {
    const visibleSet = new Set(visibleFields ?? []);
    const showField = (field: string) =>
        visibleFields === undefined || visibleSet.has(field);

    // Selling price is form-only (optional); always offer it on the pricing step
    // when the pricing step is shown, or when costPrice is visible.
    const showSellingPrice =
        visibleFields === undefined ||
        visibleSet.has("costPrice") ||
        visibleSet.has("sellingPrice") ||
        visibleSet.has("incomeAccountId");

    return (
        <FormSection
            title="Pricing & Finance"
            description="Cost, optional default selling price, and accounting settings."
        >
            <div className="grid gap-4 md:grid-cols-2">
                {showField("costPrice") && (
                    <FormNumberField
                        form={form}
                        name="costPrice"
                        label="Cost Price"
                        step="0.01"
                    />
                )}

                {showSellingPrice && (
                    <FormNumberField
                        form={form}
                        name="sellingPrice"
                        label="Default Selling Price (optional)"
                        step="0.01"
                    />
                )}

                {showField("incomeAccountId") && (
                    <FormSearchableSelect
                        control={form.control}
                        name="incomeAccountId"
                        options={context.incomeAccounts}
                        placeholder="Income Account"
                        getLabel={(account) =>
                            `${account.accountCode} - ${account.accountName}`
                        }
                    />
                )}

                {showField("expenseAccountId") && (
                    <FormSearchableSelect
                        control={form.control}
                        name="expenseAccountId"
                        options={context.expenseAccounts}
                        placeholder="Expense Account"
                        getLabel={(account) =>
                            `${account.accountCode} - ${account.accountName}`
                        }
                    />
                )}

                {showField("inventoryAccountId") && (
                    <FormSearchableSelect
                        control={form.control}
                        name="inventoryAccountId"
                        options={context.inventoryAccounts}
                        placeholder="Inventory Account"
                        getLabel={(account) =>
                            `${account.accountCode} - ${account.accountName}`
                        }
                    />
                )}

                {showField("taxRateId") && (
                    <FormSearchableSelect
                        control={form.control}
                        name="taxRateId"
                        options={context.taxRates}
                        placeholder="Tax Rate"
                        getLabel={(tax) =>
                            `${tax.name}${
                                tax.rate !== null ? ` (${tax.rate}%)` : ""
                            }`
                        }
                    />
                )}
            </div>

            {showSellingPrice && (
                <p className="text-xs text-muted-foreground">
                    If set, a selling price is created on the business default
                    price list when you save a new product. Advanced prices stay
                    in the Product Prices module.
                </p>
            )}
        </FormSection>
    );
}
