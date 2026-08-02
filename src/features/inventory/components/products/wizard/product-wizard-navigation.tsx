"use client";

interface ProductWizardNavigationProps {
    isFirstStep: boolean;
    isLastStep: boolean;
    onBack: () => void;
    onNext: () => void;
    onSave?: () => void;
}

export function ProductWizardNavigation({
    isFirstStep,
    isLastStep,
    onBack,
    onNext,
    onSave,
}: ProductWizardNavigationProps) {
    return (
        <div className="flex items-center justify-between border-t pt-6">
            <button
                type="button"
                onClick={onBack}
                disabled={isFirstStep}
                className="rounded-md border px-4 py-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
                Back
            </button>

            {isLastStep ? (
                <button
                    type="button"
                    onClick={onSave}
                    className="rounded-md bg-primary px-4 py-2 text-primary-foreground"
                >
                    Save Product
                </button>
            ) : (
                <button
                    type="button"
                    onClick={onNext}
                    className="rounded-md bg-primary px-4 py-2 text-primary-foreground"
                >
                    Next
                </button>
            )}
        </div>
    );
}