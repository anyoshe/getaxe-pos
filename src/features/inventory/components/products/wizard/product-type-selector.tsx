"use client";

import type {
    ProductType,
} from "../../../types/products";

interface ProductTypeSelectorProps {
    value: ProductType | null;
    onSelect: (
        type: ProductType,
    ) => void;
}

const PRODUCT_TYPES = [
    {
        id: "physical",
        title: "Physical Product",
        description:
            "Standard stocked products with inventory tracking.",
        icon: "📦",
    },
    {
        id: "service",
        title: "Service",
        description:
            "Non-stock services without inventory.",
        icon: "🛠️",
    },
    {
        id: "medicine",
        title: "Medicine",
        description:
            "Medicines with batches, expiry and prescription support.",
        icon: "💊",
    },
    {
        id: "raw-material",
        title: "Raw Material",
        description:
            "Materials purchased for production or manufacturing.",
        icon: "🏭",
    },
    {
        id: "finished-product",
        title: "Finished Product",
        description:
            "Manufactured goods ready for sale.",
        icon: "📦",
    },
] satisfies {
    id: ProductType;
    title: string;
    description: string;
    icon: string;
}[];

export function ProductTypeSelector({
    value,
    onSelect,
}: ProductTypeSelectorProps) {
    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-semibold">
                    Select Product Type
                </h2>

                <p className="text-muted-foreground mt-2">
                    Choose the type of product you want to create.
                </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {PRODUCT_TYPES.map((type) => {
                    const selected =
                        value === type.id;

                    return (
                        <button
                            key={type.id}
                            type="button"
                            onClick={() =>
                                onSelect(type.id)
                            }
                            className={[
                                "rounded-xl border p-6 text-left transition-all",
                                selected
                                    ? "border-primary ring-2 ring-primary"
                                    : "hover:border-primary/60",
                            ].join(" ")}
                        >
                            <div className="text-4xl">
                                {type.icon}
                            </div>

                            <h3 className="mt-4 text-lg font-semibold">
                                {type.title}
                            </h3>

                            <p className="mt-2 text-sm text-muted-foreground">
                                {type.description}
                            </p>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}