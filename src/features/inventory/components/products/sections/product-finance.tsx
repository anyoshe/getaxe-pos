"use client";

import type {
    UseFormReturn,
} from "react-hook-form";

import {
    FormSection,
    FormSearchableSelect,
} from "@/components/forms";

import type {
    ProductContext,
} from "../../../types";

import type {
    ProductFormInput,
} from "../product-form.types";

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
    const showField = (field: string) => visibleFields === undefined || visibleSet.has(field);

    return (

        <FormSection
            title="Finance"
            description="Financial and taxation settings."
        >

            <div className="grid gap-4 md:grid-cols-2">

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
                                tax.rate !== null
                                    ? ` (${tax.rate}%)`
                                    : ""
                            }`
                        }
                    />
                )}

            </div>

        </FormSection>

    );

}