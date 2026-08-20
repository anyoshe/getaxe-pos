"use client";

import type { UseFormReturn } from "react-hook-form";

import {
    FormSection,
    FormCheckbox,
    FormNumberField,
} from "@/components/forms";

import type { ProductFormInput } from "../product-form.types";

interface ProductInventoryProps {
    form: UseFormReturn<ProductFormInput>;
    context?: unknown;
    visibleFields?: string[];
    requiredFields?: string[];
}

export function ProductInventory({
    form,
    visibleFields,
    requiredFields,
}: ProductInventoryProps) {
    const visibleSet = new Set(visibleFields ?? []);
    const requiredSet = new Set(requiredFields ?? []);
    const isRequired = (field: string) => requiredSet.has(field);
    const showField = (field: string) =>
        visibleFields === undefined || visibleSet.has(field);

    const showTracking =
        showField("trackInventory") ||
        showField("trackBatch") ||
        showField("trackExpiry") ||
        showField("serialized") ||
        showField("allowNegativeStock");

    const showLevels =
        showField("minimumStock") || showField("reorderLevel");

    return (
        <div className="space-y-6">
            <FormSection
                title="Stock tracking"
                description="Choose how this product is controlled. You only turn tracking on here — batch numbers, expiry dates, and serials are entered when you receive stock."
            >
                {showTracking && (
                    <div className="grid gap-3 sm:grid-cols-2">
                        {showField("trackInventory") && (
                            <FormCheckbox
                                control={form.control}
                                name="trackInventory"
                                label="Track inventory"
                                required={isRequired("trackInventory")}
                                description="Keep quantity on hand for this product."
                            />
                        )}
                        {showField("trackBatch") && (
                            <FormCheckbox
                                control={form.control}
                                name="trackBatch"
                                label="Track batches"
                                required={isRequired("trackBatch")}
                                description="Require a batch / lot number when stock is received."
                            />
                        )}
                        {showField("trackExpiry") && (
                            <FormCheckbox
                                control={form.control}
                                name="trackExpiry"
                                label="Track expiry"
                                required={isRequired("trackExpiry")}
                                description="Require an expiry date when stock is received (e.g. medicine, food)."
                            />
                        )}
                        {showField("serialized") && (
                            <FormCheckbox
                                control={form.control}
                                name="serialized"
                                label="Track serial numbers"
                                required={isRequired("serialized")}
                                description="Capture individual serials on receive — not on this form."
                            />
                        )}
                        {showField("allowNegativeStock") && (
                            <FormCheckbox
                                control={form.control}
                                name="allowNegativeStock"
                                label="Allow negative stock"
                                required={isRequired("allowNegativeStock")}
                                description="Permit sales even when quantity would go below zero."
                            />
                        )}
                    </div>
                )}
            </FormSection>

            {showLevels && (
                <FormSection
                    title="Reorder levels"
                    description="Optional thresholds for low-stock alerts. Leave at zero if you do not use them yet."
                >
                    <div className="grid gap-4 md:grid-cols-2">
                        {showField("minimumStock") && (
                            <FormNumberField
                                form={form}
                                name="minimumStock"
                                label="Minimum stock"
                                required={isRequired("minimumStock")}
                                description="Alert when quantity falls to this level"
                            />
                        )}
                        {showField("reorderLevel") && (
                            <FormNumberField
                                form={form}
                                name="reorderLevel"
                                label="Reorder level"
                                required={isRequired("reorderLevel")}
                                description="Suggested quantity to reorder"
                            />
                        )}
                    </div>
                </FormSection>
            )}
        </div>
    );
}
