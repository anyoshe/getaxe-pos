"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

interface HoverCardProps {
  children: ReactNode;
  className?: string;

  lift?: number;
  scale?: number;
  glow?: boolean;
}

export function HoverCard({
  children,
  className,
  lift = 6,
  scale = 1.02,
  glow = false,
}: HoverCardProps) {
  return (
    <motion.div
      whileHover={{
        y: -lift,
        scale,
      }}
      transition={{
        type: "spring",
        stiffness: 320,
        damping: 22,
      }}
      className={`
        transition-shadow
        duration-300
        ${glow ? "hover:shadow-2xl hover:shadow-cyan-500/20" : ""}
        ${className ?? ""}
      `}
    >
      {children}
    </motion.div>
  );
}