"use client";

import { Loader2 } from "lucide-react";
import { ReactNode } from "react";

interface AnimatedButtonProps {
  children: ReactNode;
  loading?: boolean;
  className?: string;
}

export function AnimatedButton({
  children,
  loading = false,
  className,
}: AnimatedButtonProps) {
  return (
    <button
      disabled={loading}
      className={`
        transition-all
        duration-300
        hover:-translate-y-0.5
        hover:shadow-lg
        disabled:opacity-70
        disabled:cursor-not-allowed
        ${className}
      `}
    >
      {loading ? (
        <span className="flex items-center justify-center gap-2">
          <Loader2
            className="animate-spin"
            size={18}
          />
          Please wait...
        </span>
      ) : (
        children
      )}
    </button>
  );
}