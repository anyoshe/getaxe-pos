"use server";

import { z } from "zod";
import { eq } from "drizzle-orm";

import { db } from "@/db";
import { users } from "@/db/schema";
import { requireCurrentUser } from "@/lib/auth/current-user";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { revalidatePath } from "next/cache";

const schema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z.string().min(8, "New password must be at least 8 characters"),
    confirmPassword: z.string().min(1),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export async function changePasswordAction(input: {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}) {
  const user = await requireCurrentUser();
  const parsed = schema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false as const,
      message: parsed.error.issues[0]?.message ?? "Invalid input",
    };
  }

  const row = await db.query.users.findFirst({
    where: eq(users.id, user.id),
  });
  if (!row?.passwordHash) {
    return { success: false as const, message: "Account not found." };
  }

  const ok = await verifyPassword(
    parsed.data.currentPassword,
    row.passwordHash,
  );
  if (!ok) {
    return { success: false as const, message: "Current password is incorrect." };
  }

  const passwordHash = await hashPassword(parsed.data.newPassword);
  await db
    .update(users)
    .set({ passwordHash, updatedAt: new Date() })
    .where(eq(users.id, user.id));

  revalidatePath("/settings/security");
  return { success: true as const, message: "Password updated." };
}
