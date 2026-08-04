"use server";

import {
  redirect,
} from "next/navigation";

import {
  createPasswordSchema,
} from "../schemas/create-password-schema";

import {
  createPasswordService,
} from "../services/create-password.service";

export async function createPasswordAction(
  formData: FormData,
) {

  const parsed =
    createPasswordSchema.safeParse({

      email: formData.get("email"),

      password: formData.get("password"),

      confirmPassword:
        formData.get("confirmPassword"),

    });

  if (!parsed.success) {

    return {

      success: false,

      errors:
        parsed.error.flatten(),

    };

  }

  await createPasswordService.createPassword(

    parsed.data.email,

    parsed.data.password,

  );

  redirect("/login");

}