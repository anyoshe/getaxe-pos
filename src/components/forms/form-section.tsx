"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface FormSectionProps {
    title: string;
    description?: string;
    children: ReactNode;
    className?: string;
}

/** Lightweight section — no nested heavy cards inside the wizard shell. */
export function FormSection({
    title,
    description,
    children,
    className,
}: FormSectionProps) {
    return (
        <section className={cn("space-y-4", className)}>
            <header className="space-y-1">
                <h3 className="text-base font-semibold tracking-tight">
                    {title}
                </h3>
                {description ? (
                    <p className="text-sm leading-relaxed text-muted-foreground">
                        {description}
                    </p>
                ) : null}
            </header>
            <div className="space-y-4">{children}</div>
        </section>
    );
}
