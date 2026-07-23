"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

interface StaggerProps {
  children: ReactNode;
  className?: string;

  stagger?: number;
  delayChildren?: number;
}

export function Stagger({
  children,
  className,
  stagger = 0.08,
  delayChildren = 0,
}: StaggerProps) {
  return (
    <motion.div
      initial="hidden"
      whileInView="show"
      viewport={{
        once: true,
        amount: 0.2,
      }}
      variants={{
        hidden: {},
        show: {
          transition: {
            staggerChildren: stagger,
            delayChildren,
          },
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}