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
        className={`pr-12 ${className}`}
      />

      <button
        type="button"
        aria-label={
          showPassword
            ? "Hide password"
            : "Show password"
        }
        aria-pressed={showPassword}
        onClick={() =>
          setShowPassword((prev) => !prev)
        }
        className="
          absolute
          right-4
          top-5

          flex
          items-center
          justify-center

          text-white/60

          transition-all
          duration-200

          hover:text-cyan-300
          hover:scale-110

          active:scale-95

          focus:outline-none
          focus:text-cyan-300
        "
      >
        <span
          className="
            transition-all
            duration-200
          "
        >
          {showPassword ? (
            <EyeOff size={18} />
          ) : (
            <Eye size={18} />
          )}
        </span>
      </button>
    </div>
  );
}