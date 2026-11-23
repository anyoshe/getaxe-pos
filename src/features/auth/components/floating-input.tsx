"use client";

import { type ComponentPropsWithRef, useId } from "react";

type FloatingInputProps = ComponentPropsWithRef<"input"> & {
  label: string;
  error?: string;
  helperText?: string;
};

export function FloatingInput({
  label,
  error,
  helperText,
  className = "",
  required,
  disabled,
  id,
  ...props
}: FloatingInputProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const hasError = Boolean(error);

  return (
    <div className="space-y-2">
      <div className="relative">
        <input
          id={inputId}
          placeholder=" "
          required={required}
          disabled={disabled}
          aria-invalid={hasError}
          aria-describedby={
            hasError
              ? `${inputId}-error`
              : helperText
                ? `${inputId}-helper`
                : undefined
          }
          className={`
            peer w-full rounded-2xl border bg-card/10 px-4 pb-2 pt-6 text-white
            placeholder-transparent outline-none backdrop-blur-md transition-all duration-300
            ${
              hasError
                ? "border-rose-500 focus:border-rose-400 focus:shadow-lg focus:shadow-rose-500/20 focus:ring-4 focus:ring-rose-500/20"
                : "border-white/20 focus:border-cyan-400 focus:shadow-lg focus:shadow-cyan-500/20 focus:ring-4 focus:ring-cyan-500/20"
            }
            disabled:cursor-not-allowed disabled:opacity-50
            ${className}
          `}
          {...props}
        />
        <label
          htmlFor={inputId}
          className="pointer-events-none absolute left-4 top-4 text-white/60 transition-all duration-300
            peer-placeholder-shown:top-4 peer-placeholder-shown:text-base
            peer-focus:-translate-y-2 peer-focus:text-xs peer-focus:text-cyan-300
            peer-not-placeholder-shown:-translate-y-2 peer-not-placeholder-shown:text-xs"
        >
          {label}
          {required ? <span className="ml-1 text-rose-400">*</span> : null}
        </label>
      </div>
      {hasError ? (
        <p id={`${inputId}-error`} className="text-sm text-rose-400">
          {error}
        </p>
      ) : helperText ? (
        <p id={`${inputId}-helper`} className="text-sm text-white/50">
          {helperText}
        </p>
      ) : null}
    </div>
  );
}
