"use client";

import type {
    ProductWizardStep,
} from "./use-product-wizard";

interface ProductWizardHeaderProps {
    steps: ProductWizardStep[];
    currentStep: number;
}

export function ProductWizardHeader({
    steps,
    currentStep,
}: ProductWizardHeaderProps) {
    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-semibold">
                    Product Wizard
                </h2>

                <p className="text-sm text-muted-foreground">
                    Complete the steps below to create a product.
                </p>
            </div>

            <div className="flex items-start">
                {steps.map((step, index) => {
                    const completed =
                        index < currentStep;

                    const active =
                        index === currentStep;

                    return (
                        <div
                            key={step.id}
                            className="flex flex-1 items-center"
                        >
                            <div className="flex flex-col items-center">
                                <div
                                    className={[
                                        "flex h-10 w-10 items-center justify-center rounded-full border-2 text-sm font-semibold transition-colors",
                                        completed
                                            ? "border-primary bg-primary text-primary-foreground"
                                            : active
                                              ? "border-primary text-primary"
                                              : "border-muted-foreground/30 text-muted-foreground",
                                    ].join(" ")}
                                >
                                    {completed
                                        ? "✓"
                                        : index + 1}
                                </div>

                                <span
                                    className={[
                                        "mt-2 text-center text-xs",
                                        active
                                            ? "font-medium text-foreground"
                                            : "text-muted-foreground",
                                    ].join(" ")}
                                >
                                    {step.title}
                                </span>
                            </div>

                            {index < steps.length - 1 && (
                                <div
                                    className={[
                                        "mx-3 mb-8 h-0.5 flex-1",
                                        completed
                                            ? "bg-primary"
                                            : "bg-border",
                                    ].join(" ")}
                                />
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}