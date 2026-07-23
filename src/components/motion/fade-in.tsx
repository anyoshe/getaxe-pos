"use client";

import { motion, Variants } from "framer-motion";
import { ReactNode } from "react";

type Direction =
  | "up"
  | "down"
  | "left"
  | "right";

interface FadeInProps {
  children: ReactNode;
  className?: string;

  delay?: number;
  duration?: number;

  direction?: Direction;

  distance?: number;

  once?: boolean;

  /**
   * Enables parent-controlled stagger animation.
   */
  staggerChild?: boolean;
}

export function FadeIn({
  children,
  className,

  delay = 0,
  duration = 0.6,

  direction = "up",

  distance = 24,

  once = true,

  staggerChild = false,
}: FadeInProps) {
  const initial = {
    opacity: 0,

    x:
      direction === "left"
        ? distance
        : direction === "right"
        ? -distance
        : 0,

    y:
      direction === "up"
        ? distance
        : direction === "down"
        ? -distance
        : 0,
  };

  const variants: Variants = {
    hidden: initial,

    show: {
      opacity: 1,
      x: 0,
      y: 0,
      transition: {
        duration,
        ease: "easeOut",
      },
    },
  };

  if (staggerChild) {
    return (
      <motion.div
        variants={variants}
        className={className}
      >
        {children}
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={initial}
      whileInView={{
        opacity: 1,
        x: 0,
        y: 0,
      }}
      viewport={{
        once,
        amount: 0.2,
      }}
      transition={{
        duration,
        delay,
        ease: "easeOut",
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}