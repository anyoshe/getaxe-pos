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
            description="Cost and optional shelf price. Full price lists stay in Pricing. Accounts can use business defaults later."
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

                {showField("incomeAccountId") && (
                    <FormSearchableSelect
                        control={form.control}
                        name="incomeAccountId"
                        options={context.incomeAccounts}
                        placeholder="Income Account"
                        getLabel={(account) =>
                            `${account.accountCode} - ${account.accountName}`
                        }
                    
                        required={isRequired("incomeAccountId")}
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
                    
                        required={isRequired("expenseAccountId")}
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
                    
                        required={isRequired("inventoryAccountId")}
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
                    
                        required={isRequired("taxRateId")}
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
