"use client";

import type { ReactNode } from "react";

interface BusinessSetupCardProps {
  children: ReactNode;
}

export function BusinessSetupCard({
  children,
}: BusinessSetupCardProps) {
  return <div>{children}</div>;
}