"use client";

import Link from "next/link";

import { FloatingInput } from "./floating-input";
import { PasswordInput } from "./password-input";
import { RememberCheckbox } from "./remember-checkbox";

export function LoginForm() {
  return (
    <form className="space-y-6">

      <FloatingInput
        label="Email Address"
        type="email"
      />

      <PasswordInput />

      <div className="flex items-center justify-between">

        <RememberCheckbox />

        <Link
          href="/forgot-password"
          className="text-sm text-cyan-300 hover:text-cyan-200"
        >
          Forgot Password?
        </Link>

      </div>

      <button
        className="
          w-full
          rounded-2xl
          bg-gradient-to-r
          from-indigo-600
          via-violet-600
          to-cyan-500
          py-3
          font-semibold
          text-white
          transition-all
          duration-300
          hover:-translate-y-0.5
          hover:shadow-xl
          hover:shadow-cyan-500/40
        "
      >
        Sign In
      </button>

    </form>
  );
}