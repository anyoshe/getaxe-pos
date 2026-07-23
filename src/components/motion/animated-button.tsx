"use client";

import { ReactNode } from "react";
import { Loader2 } from "lucide-react";
import { motion } from "framer-motion";

interface AnimatedButtonProps {
  children: ReactNode;
  loading?: boolean;
  disabled?: boolean;
  className?: string;
  type?: "button" | "submit" | "reset";
}

export function AnimatedButton({
  children,
  loading = false,
  disabled = false,
  className,
  type = "button",
}: AnimatedButtonProps) {
  const isDisabled = loading || disabled;

  return (
    <motion.button
      type={type}
      disabled={isDisabled}
      whileHover={!isDisabled ? { y: -2, scale: 1.01 } : undefined}
      whileTap={!isDisabled ? { scale: 0.98 } : undefined}
      transition={{
        type: "spring",
        stiffness: 400,
        damping: 18,
      }}
      className={`
        flex
        w-full
        items-center
        justify-center
        gap-2
        rounded-2xl
        transition-all
        duration-300
        disabled:cursor-not-allowed
        disabled:opacity-70
        ${className}
      `}
    >
      {loading ? (
        <>
          <Loader2
            size={18}
            className="animate-spin"
          />
          <span>Signing in...</span>
        </>
      ) : (
        children
      )}
    </motion.button>
  );
}