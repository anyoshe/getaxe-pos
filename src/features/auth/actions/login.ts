// "use server";

// import { redirect } from "next/navigation";


// import { authenticateUser } from "../services/auth-service";
// import type { LoginInput } from "../schemas/login-schema";

// import { createSession } from "@/lib/auth/session";

// export type LoginResult =
//   | {
//       success: true;
//     }
//   | {
//       success: false;
//       message: string;
//     };

// export async function login(
//   credentials: LoginInput,
// ): Promise<LoginResult> {

//   const result =
//     await authenticateUser(
//       credentials,
//     );

//   switch (result.type) {

//     case "INVALID":

//       return {
//         success: false,
//         message: "Invalid email or password.",
//       };

//     case "CREATE_PASSWORD":

//       redirect(
//         `/create-password?email=${encodeURIComponent(result.email)}`,
//       );

//     case "BUSINESS_SETUP":

//       redirect(
//         `/setup?email=${encodeURIComponent(result.email)}`,
//       );

//     case "USER":

//       await createSession({

//         userId: result.user.id,

//         businessId: result.user.businessId,

//         roleId: result.user.roleId,

//         email: result.user.email,

//       });

//       redirect("/dashboard");

//   }

// }

"use server";

import { redirect } from "next/navigation";

import {
  authenticateUser,
} from "../services/auth-service";

import type {
  LoginInput,
} from "../schemas/login-schema";

import {
  createSession,
} from "@/lib/auth/session";

import {
  createOnboardingSession,
} from "@/lib/onboarding-auth/session";

export type LoginResult =
  | {
      success: true;
    }
  | {
      success: false;
      message: string;
    };

export async function login(
  credentials: LoginInput,
): Promise<LoginResult> {

  const result =
    await authenticateUser(
      credentials,
    );

  switch (result.type) {

    case "INVALID":

      return {
        success: false,
        message: "Invalid email or password.",
      };

    case "CREATE_PASSWORD":

      redirect(
        `/create-password?email=${encodeURIComponent(result.email)}`,
      );

    case "BUSINESS_SETUP":

      await createOnboardingSession({

        invitationId:
          result.invitationId,

        email:
          result.email,

      });

      redirect("/setup");

    case "USER":

      await createSession({

        userId:
          result.user.id,

        businessId:
          result.user.businessId,

        roleId:
          result.user.roleId,

        email:
          result.user.email,

      });

      // Owners still missing catalogue → land on go-live, not empty dashboard
      {
        const roleName = (result.user.role?.name ?? "").toUpperCase();
        const isOwnerRole =
          roleName === "ADMINISTRATOR" ||
          roleName.includes("OWNER") ||
          roleName.includes("ADMIN");

        if (isOwnerRole) {
          try {
            const { getSetupReadiness } = await import(
              "@/features/settings/services/setup-readiness.service"
            );
            const readiness = await getSetupReadiness(result.user.businessId);
            const productCheck = readiness.checks.find((c) => c.id === "product");
            const noProducts = productCheck
              ? !productCheck.done
              : readiness.score < 40;
            if (noProducts) {
              redirect("/settings/go-live");
            }
          } catch {
            // Readiness failure must not block login
          }
        }
      }

      redirect("/dashboard");

  }

}