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
            <div className="overflow-hidden rounded-2xl brand-gradient p-[1px] shadow-sm">
                <div className="rounded-[0.95rem] bg-card/95 px-4 py-3.5 sm:px-5">
                    <div className="flex flex-wrap items-end justify-between gap-2">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-wide text-primary">
                                New product
                                {productTypeLabel ? ` · ${productTypeLabel}` : ""}
                            </p>
                            <h2 className="text-xl font-semibold tracking-tight text-foreground">
                                {active?.title ?? "Product"}
                            </h2>
                            <p className="mt-1 text-sm text-muted-foreground">
                                Step {currentStep + 1} of {steps.length} — product
                                master only. Batches & serials are captured when
                                you receive stock.
                            </p>
                        </div>
                        <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
                            {progress}%
                        </span>
                    </div>

                    <div className="mt-3 h-2 overflow-hidden rounded-full bg-secondary">
                        <div
                            className="h-full rounded-full brand-gradient transition-all duration-300 ease-out"
                            style={{ width: `${Math.max(progress, 8)}%` }}
                        />
                    </div>
                </div>
            </div>

            <div className="-mx-1 flex gap-1.5 overflow-x-auto px-1 pb-1">
                {steps.map((step, index) => {
                    const done = index < currentStep;
                    const isActive = index === currentStep;
                    return (
                        <div
                            key={step.id}
                            className={cn(
                                "flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium transition-colors",
                                done &&
                                    "border-primary/40 bg-primary/10 text-primary",
                                isActive &&
                                    "border-transparent bg-primary text-primary-foreground shadow-sm",
                                !done &&
                                    !isActive &&
                                    "border-border bg-secondary/60 text-muted-foreground",
                            )}
                        >
                            <span
                                className={cn(
                                    "flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-bold",
                                    isActive && "bg-primary-foreground/20",
                                    done && "bg-primary/15",
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
