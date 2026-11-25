"use client";

import { useState, useTransition } from "react";
import Link from "next/link";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { login } from "../actions/login";
import { loginSchema, type LoginInput } from "../schemas/login-schema";

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
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  function onSubmit(values: LoginInput) {
    setServerError("");
    startTransition(async () => {
      const result = await login(values);
      if (!result.success) setServerError(result.message);
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 sm:space-y-5">
      <FloatingInput
        label="Email"
        type="email"
        autoComplete="email"
        inputMode="email"
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

      <div className="flex flex-wrap items-center justify-between gap-2 pt-0.5">
        <RememberCheckbox
          checked={rememberMe}
          onCheckedChange={setRememberMe}
        />
        <Link
          href="/forgot-password"
          className="text-sm text-cyan-300/90 hover:text-cyan-200 hover:underline"
        >
          Forgot password?
        </Link>
      </div>

      {serverError ? (
        <div
          role="alert"
          className="rounded-xl border border-rose-400/30 bg-rose-500/10 px-3 py-2.5 text-sm text-rose-200"
        >
          {serverError}
        </div>
      ) : null}

      <AnimatedButton
        type="submit"
        loading={pending}
        className="w-full py-3 font-semibold text-white bg-gradient-to-r from-indigo-600 via-violet-600 to-cyan-500"
      >
        Sign in
      </AnimatedButton>
    </form>
  );
}
