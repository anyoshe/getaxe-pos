"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireAuthorizedUser } from "@/lib/auth/authorize";
import { customerRepository } from "@/repositories/sales/customer.repository";

const schema = z.object({
  customerType: z.enum(["INDIVIDUAL", "BUSINESS"]).default("INDIVIDUAL"),
  firstName: z.string().trim().min(1, "First name is required"),
  lastName: z.string().trim().optional().nullable(),
  companyName: z.string().trim().optional().nullable(),
  phone: z.string().trim().min(7, "Phone is required"),
  email: z.string().trim().email().optional().nullable().or(z.literal("")),
  idType: z.string().trim().optional().nullable(),
  idNumber: z.string().trim().optional().nullable(),
  taxPin: z.string().trim().optional().nullable(),
  dateOfBirth: z.string().trim().optional().nullable(),
  gender: z.enum(["MALE", "FEMALE", "OTHER"]).optional().nullable(),
  address: z.string().trim().optional().nullable(),
  city: z.string().trim().optional().nullable(),
  county: z.string().trim().optional().nullable(),
  postalCode: z.string().trim().optional().nullable(),
  occupation: z.string().trim().optional().nullable(),
  employer: z.string().trim().optional().nullable(),
  emergencyContact: z.string().trim().optional().nullable(),
  emergencyPhone: z.string().trim().optional().nullable(),
  allowCredit: z.boolean().optional().default(false),
  creditLimit: z.coerce.number().min(0).optional().default(0),
  creditTermsDays: z.coerce.number().int().min(0).optional().default(30),
  creditNotes: z.string().trim().optional().nullable(),
});

export async function createCustomerAction(input: unknown) {
  const user = await requireAuthorizedUser("sales.create");
  const parsed = schema.safeParse(input);
  if (!parsed.success) {
    const fe = parsed.error.flatten().fieldErrors;
    return {
      success: false as const,
      message: fe.firstName?.[0] || fe.phone?.[0] || "Check customer KYC details.",
    };
  }

  const data = parsed.data;

  if (data.customerType === "BUSINESS" && !data.companyName?.trim()) {
    return {
      success: false as const,
      message: "Company name is required for business customers.",
    };
  }

  if (data.allowCredit) {
    if (!data.idNumber?.trim()) {
      return {
        success: false as const,
        message: "National ID / passport number is required for credit accounts.",
      };
    }
    if (!data.address?.trim()) {
      return {
        success: false as const,
        message: "Physical address is required for credit accounts.",
      };
    }
    if (!data.creditLimit || data.creditLimit <= 0) {
      return {
        success: false as const,
        message: "Set a credit limit greater than zero for credit accounts.",
      };
    }
    if (!data.emergencyContact?.trim() || !data.emergencyPhone?.trim()) {
      return {
        success: false as const,
        message: "Next of kin name and phone are required for credit accounts.",
      };
    }
  }

  const customerNumber = `CUS-${Date.now().toString(36).toUpperCase()}`;

  try {
    await customerRepository.create({
      businessId: user.businessId,
      customerNumber,
      customerType: data.customerType,
      firstName: data.firstName,
      lastName: data.lastName || null,
      companyName: data.companyName || null,
      phone: data.phone || null,
      email: data.email || null,
      idType: data.idType || null,
      idNumber: data.idNumber || null,
      taxPin: data.taxPin || null,
      dateOfBirth: data.dateOfBirth || null,
      gender: data.gender || null,
      address: data.address || null,
      city: data.city || null,
      county: data.county || null,
      postalCode: data.postalCode || null,
      occupation: data.occupation || null,
      employer: data.employer || null,
      emergencyContact: data.emergencyContact || null,
      emergencyPhone: data.emergencyPhone || null,
      allowCredit: Boolean(data.allowCredit),
      creditLimit: String(data.creditLimit ?? 0),
      creditTermsDays: data.creditTermsDays ?? 30,
      creditNotes: data.creditNotes || null,
      active: true,
    } as Parameters<typeof customerRepository.create>[0]);

    revalidatePath("/customers");
    revalidatePath("/sales/pos");
    return {
      success: true as const,
      message: data.allowCredit
        ? "Credit customer account created."
        : "Customer created.",
    };
  } catch (error) {
    return {
      success: false as const,
      message:
        error instanceof Error ? error.message : "Failed to create customer.",
    };
  }
}
