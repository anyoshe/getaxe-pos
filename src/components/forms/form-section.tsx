"use client";

import type { ReactNode } from "react";

import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

interface FormSectionProps {
    title: string;
    description?: string;
    children: ReactNode;
}

export function FormSection({
    title,
    description,
    children,
}: FormSectionProps) {

    return (

        <Card>

            <CardHeader>

                <CardTitle>
                    {title}
                </CardTitle>

                {description && (
                    <p className="text-sm text-muted-foreground">
                        {description}
                    </p>
                )}

            </CardHeader>

            <CardContent className="space-y-4">

                {children}

            </CardContent>

        </Card>

    );

}