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
    <div className="space-y-1.5">
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
            peer min-h-12 w-full rounded-xl border bg-white/10 px-3.5 pb-2 pt-5 text-base text-white
            placeholder-transparent outline-none backdrop-blur-md transition
            sm:min-h-[3.25rem] sm:rounded-2xl sm:px-4 sm:text-[15px]
            ${
              hasError
                ? "border-rose-400/80 focus:border-rose-300 focus:ring-2 focus:ring-rose-500/30"
                : "border-white/20 focus:border-cyan-400/80 focus:ring-2 focus:ring-cyan-500/25"
            }
            disabled:cursor-not-allowed disabled:opacity-50
            ${className}
          `}
          {...props}
        />
        <label
          htmlFor={inputId}
          className="pointer-events-none absolute left-3.5 top-3.5 text-sm text-white/55 transition-all duration-200
            peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-base
            peer-focus:top-1.5 peer-focus:text-[11px] peer-focus:text-cyan-300
            peer-[&:not(:placeholder-shown)]:top-1.5 peer-[&:not(:placeholder-shown)]:text-[11px]
            sm:left-4"
        >
          {label}
          {required ? <span className="ml-0.5 text-rose-300">*</span> : null}
        </label>
      </div>
      {hasError ? (
        <p id={`${inputId}-error`} className="text-xs text-rose-300 sm:text-sm">
          {error}
        </p>
      ) : helperText ? (
        <p id={`${inputId}-helper`} className="text-xs text-white/45">
          {helperText}
        </p>
      ) : null}
    </div>
  );
}
