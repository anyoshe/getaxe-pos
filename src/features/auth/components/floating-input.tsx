"use client";

import { InputHTMLAttributes, useId } from "react";

interface FloatingInputProps
  extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

export function FloatingInput({
  label,
  className = "",
  ...props
}: FloatingInputProps) {
  const id = useId();

  return (
    <div className="relative">
      <input
        id={id}
        placeholder=" "
        className={`
          peer
          w-full
          rounded-2xl
          border
          border-white/20
          bg-white/10
          px-4
          pt-6
          pb-2
          text-white
          backdrop-blur-md
          outline-none
          transition-all
          duration-300
          focus:border-cyan-400
          focus:ring-2
          focus:ring-cyan-400/30
          ${className}
        `}
        {...props}
      />

      <label
        htmlFor={id}
        className="
          absolute
          left-4
          top-4
          text-white/60
          transition-all
          duration-200
          pointer-events-none

          peer-placeholder-shown:text-base
          peer-placeholder-shown:top-4

          peer-focus:text-xs
          peer-focus:-translate-y-2

          peer-not-placeholder-shown:text-xs
          peer-not-placeholder-shown:-translate-y-2
        "
      >
        {label}
      </label>
    </div>
  );
}