"use client";

import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";

interface ProductWizardNavigationProps {
    isFirstStep: boolean;
    isLastStep: boolean;
    pending?: boolean;
    onBack: () => void;
    onNext: () => void;
    onSave: () => void;
}

export function ProductWizardNavigation({
    isFirstStep,
    isLastStep,
    pending = false,
    onBack,
    onNext,
    onSave,
}: ProductWizardNavigationProps) {
    return (
        <div className="flex flex-wrap items-center justify-between gap-3 border-t pt-4">
            <Button
                type="button"
                variant="ghost"
                onClick={onBack}
                disabled={isFirstStep || pending}
                className="gap-1.5"
            >
                <ArrowLeft className="size-4" />
                Back
            </Button>

            <div className="flex gap-2">
                {!isLastStep ? (
                    <Button
                        type="button"
                        onClick={onNext}
                        disabled={pending}
                        className="gap-1.5 min-w-[7.5rem]"
                    >
                        Continue
                        <ArrowRight className="size-4" />
                    </Button>
                ) : (
                    <Button
                        type="button"
                        onClick={onSave}
                        disabled={pending}
                        className="gap-1.5 min-w-[7.5rem]"
                    >
                        <Check className="size-4" />
                        {pending ? "Saving…" : "Save product"}
                    </Button>
                )}
            </div>
        </div>
    );
}
