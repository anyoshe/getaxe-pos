"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireAuthorizedUser } from "@/lib/auth/authorize";
import { customerRepository } from "@/repositories/sales/customer.repository";

const schema = z.object({
  firstName: z.string().trim().min(1).optional().nullable(),
  lastName: z.string().trim().optional().nullable(),
  companyName: z.string().trim().optional().nullable(),
  phone: z.string().trim().optional().nullable(),
  email: z.string().trim().email().optional().nullable().or(z.literal("")),
  customerType: z.enum(["INDIVIDUAL", "BUSINESS"]).default("INDIVIDUAL"),
});

export async function createCustomerAction(input: unknown) {
  const user = await requireAuthorizedUser("sales.create");
  const parsed = schema.safeParse(input);
  if (!parsed.success) {
    return { success: false as const, message: "Check customer details." };
  }

  const data = parsed.data;
  if (!data.firstName && !data.companyName) {
    return {
      success: false as const,
      message: "Provide a name or company name.",
    };
  }

  const customerNumber = `CUS-${Date.now().toString(36).toUpperCase()}`;

  try {
    await customerRepository.create({
      businessId: user.businessId,
      customerNumber,
      customerType: data.customerType,
      firstName: data.firstName || data.companyName || "Customer",
      lastName: data.lastName || null,
      companyName: data.companyName || null,
      phone: data.phone || null,
      email: data.email || null,
      active: true,
    });

    revalidatePath("/customers");
    return { success: true as const, message: "Customer created." };
  } catch (error) {
    return {
      success: false as const,
      message:
        error instanceof Error ? error.message : "Failed to create customer.",
    };
  }
}
