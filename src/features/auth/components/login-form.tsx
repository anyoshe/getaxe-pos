"use client";

import { useState, useTransition } from "react";
import Link from "next/link";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { login } from "../actions/login";
import {
  loginSchema,
  type LoginInput,
} from "../schemas/login-schema";

import { FloatingInput } from "./floating-input";
import { PasswordInput } from "./password-input";
import { RememberCheckbox } from "./remember-checkbox";

import { AnimatedButton } from "@/components/motion";

export function LoginForm() {
  const [serverError, setServerError] = useState("");

  const [pending, startTransition] = useTransition();

  const [rememberMe, setRememberMe] = useState(false);

  const {
    register,
    handleSubmit,
    formState: {
      errors,
    },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),

    defaultValues: {
      email: "",
      password: "",
    },
  });

  function onSubmit(values: LoginInput) {
    setServerError("");

    startTransition(async () => {
      const result = await login(values);

      if (!result.success) {
        setServerError(result.message);
      }
    });
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-6"
    >
      <FloatingInput
        label="Email Address"
        autoComplete="email"
        required
        error={errors.email?.message}
        {...register("email")}
      />

      <PasswordInput
        label="Password"
        autoComplete="current-password"
        required
        error={errors.password?.message}
        {...register("password")}
      />

      <div className="flex items-center justify-between">
        <RememberCheckbox
          checked={rememberMe}
          onCheckedChange={setRememberMe}
        />

        <Link
          href="/forgot-password"
          className="
            text-sm
            text-cyan-300
            transition-colors
            duration-200
            hover:text-cyan-200
          "
        >
          Forgot Password?
        </Link>
      </div>

      {serverError && (
        <div
          className="
            rounded-xl
            border
            border-rose-500/40
            bg-rose-500/10
            px-4
            py-3
            text-sm
            text-rose-300
          "
        >
          {serverError}
        </div>
      )}

      <AnimatedButton
        type="submit"
        loading={pending}
        className="
          py-3

          bg-gradient-to-r
          from-indigo-600
          via-violet-600
          to-cyan-500

          font-semibold
          text-white
        "
      >
        Sign In
      </AnimatedButton>
    </form>
  );
}