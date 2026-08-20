"use client";

import type { ProductWizardStep } from "./use-product-wizard";
import { cn } from "@/lib/utils";

interface ProductWizardHeaderProps {
    steps: ProductWizardStep[];
    currentStep: number;
    productTypeLabel?: string;
}

export function ProductWizardHeader({
    steps,
    currentStep,
    productTypeLabel,
}: ProductWizardHeaderProps) {
    const progress =
        steps.length <= 1
            ? 100
            : Math.round((currentStep / (steps.length - 1)) * 100);

    const active = steps[currentStep];

    return (
        <div className="space-y-4">
            <div className="flex flex-wrap items-end justify-between gap-2">
                <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        New product
                        {productTypeLabel ? ` · ${productTypeLabel}` : ""}
                    </p>
                    <h2 className="text-xl font-semibold tracking-tight">
                        {active?.title ?? "Product"}
                    </h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Step {currentStep + 1} of {steps.length} — only product
                        master data. Stock batches and serials come later on
                        receive.
                    </p>
                </div>
                <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
                    {progress}%
                </span>
            </div>

            {/* Progress bar */}
            <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                <div
                    className="h-full rounded-full bg-primary transition-all duration-300 ease-out"
                    style={{ width: `${Math.max(progress, 8)}%` }}
                />
            </div>

            {/* Compact step chips — scroll on small screens */}
            <div className="-mx-1 flex gap-1.5 overflow-x-auto px-1 pb-1">
                {steps.map((step, index) => {
                    const done = index < currentStep;
                    const isActive = index === currentStep;
                    return (
                        <div
                            key={step.id}
                            className={cn(
                                "flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs transition-colors",
                                done &&
                                    "border-primary/30 bg-primary/10 text-primary",
                                isActive &&
                                    "border-primary bg-primary text-primary-foreground",
                                !done &&
                                    !isActive &&
                                    "border-border text-muted-foreground",
                            )}
                        >
                            <span
                                className={cn(
                                    "flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-semibold",
                                    isActive && "bg-primary-foreground/20",
                                    done && "bg-primary/20",
                                    !done && !isActive && "bg-muted",
                                )}
                            >
                                {done ? "✓" : index + 1}
                            </span>
                            {step.title}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
