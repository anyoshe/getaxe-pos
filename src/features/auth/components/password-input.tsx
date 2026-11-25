"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

import { FloatingInput } from "./floating-input";

type PasswordInputProps = Omit<
  React.ComponentProps<typeof FloatingInput>,
  "type"
> & {
  label?: string;
};

export function PasswordInput({
  label = "Password",
  className = "",
  ...props
}: PasswordInputProps) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="relative">
      <FloatingInput
        {...props}
        label={label}
        type={showPassword ? "text" : "password"}
        className={`pr-11 ${className}`}
      />
      <button
        type="button"
        aria-label={showPassword ? "Hide password" : "Show password"}
        aria-pressed={showPassword}
        onClick={() => setShowPassword((prev) => !prev)}
        className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-white/55 transition hover:bg-white/10 hover:text-cyan-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/50"
      >
        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
      </button>
    </div>
  );
}
