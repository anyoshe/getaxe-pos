"use client";

import {
  useState,
  useTransition,
} from "react";

import {
  useForm,
} from "react-hook-form";

import {
  zodResolver,
} from "@hookform/resolvers/zod";

import {
  createPasswordAction,
} from "../actions/create-password";

import {
  createPasswordSchema,
  type CreatePasswordInput,
} from "../schemas/create-password-schema";

import {
  PasswordInput,
} from "./password-input";

import {
  AnimatedButton,
} from "@/components/motion";

type Props = {

  email: string;

};

export function CreatePasswordForm({
  email,
}: Props) {

  const [pending, startTransition] =
    useTransition();

  const [serverError, setServerError] =
    useState("");

  const {
    register,
    handleSubmit,
    formState: {
      errors,
    },
  } = useForm<CreatePasswordInput>({

    resolver:
      zodResolver(
        createPasswordSchema,
      ),

    defaultValues: {

      email,

      password: "",

      confirmPassword: "",

    },

  });

  function onSubmit(
    values: CreatePasswordInput,
  ) {

    setServerError("");

    startTransition(async () => {

      const formData =
        new FormData();

      formData.append(
        "email",
        values.email,
      );

      formData.append(
        "password",
        values.password,
      );

      formData.append(
        "confirmPassword",
        values.confirmPassword,
      );

      const result =
        await createPasswordAction(
          formData,
        );

      if (
        result &&
        !result.success
      ) {

        setServerError(
          "Unable to create password.",
        );

      }

    });

  }

  return (

    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-6"
    >

      <input
        type="hidden"
        {...register("email")}
      />

      <PasswordInput
        label="Password"
        autoComplete="new-password"
        required
        error={
          errors.password?.message
        }
        {...register("password")}
      />

      <PasswordInput
        label="Confirm Password"
        autoComplete="new-password"
        required
        error={
          errors.confirmPassword
            ?.message
        }
        {...register(
          "confirmPassword",
        )}
      />

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
        Create Password
      </AnimatedButton>

    </form>

  );

}