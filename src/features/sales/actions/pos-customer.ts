"use server";

import { z } from "zod";

import { requireAuthorizedUser } from "@/lib/auth/authorize";
import { customerRepository } from "@/repositories/sales/customer.repository";

function normalizePhone(phone: string) {
  return phone.replace(/[\s\-()]/g, "").trim();
}

/**
 * Look up a registered customer by phone (loyalty / rewards key).
 */
export async function lookupCustomerByPhoneAction(phone: string) {
  const user = await requireAuthorizedUser("sales.create");
  const cleaned = normalizePhone(phone);
  if (cleaned.length < 7) {
    return { success: false as const, message: "Enter a valid phone number." };
  }

  const customer = await customerRepository.findByPhone(
    user.businessId,
    cleaned,
  );

  if (!customer) {
    return {
      success: true as const,
      found: false as const,
      message: "No customer with that number — you can capture details for the receipt.",
    };
  }

  return {
    success: true as const,
    found: true as const,
    customer: {
      id: customer.id,
      firstName: customer.firstName,
      lastName: customer.lastName,
      phone: customer.phone,
      customerNumber: customer.customerNumber,
      displayName: [customer.firstName, customer.lastName]
        .filter(Boolean)
        .join(" "),
    },
  };
}

/**
 * Find by phone or create a light customer record (POS capture).
 * Used when cashier enters name + phone for receipt / future rewards.
 */
export async function ensurePosCustomerAction(input: unknown) {
  const user = await requireAuthorizedUser("sales.create");
  const parsed = z
    .object({
      phone: z.string().trim().min(7),
      firstName: z.string().trim().min(1).optional().nullable(),
      lastName: z.string().trim().optional().nullable(),
    })
    .safeParse(input);

  if (!parsed.success) {
    return {
      success: false as const,
      message: "Phone is required (name optional for walk-in receipt).",
    };
  }

  const phone = normalizePhone(parsed.data.phone);
  const existing = await customerRepository.findByPhone(
    user.businessId,
    phone,
  );

  if (existing) {
    // Optionally refresh name if cashier provided one and existing is generic
    if (
      parsed.data.firstName &&
      (existing.firstName === "Customer" || existing.firstName === "Walk-in")
    ) {
      await customerRepository.update(existing.id, {
        firstName: parsed.data.firstName,
        lastName: parsed.data.lastName ?? existing.lastName,
      });
    }

    return {
      success: true as const,
      customerId: existing.id,
      created: false as const,
      displayName: [existing.firstName, existing.lastName]
        .filter(Boolean)
        .join(" "),
      phone: existing.phone ?? phone,
    };
  }

  const firstName =
    parsed.data.firstName?.trim() ||
    "Customer";
  const customerNumber = `CUS-${Date.now().toString(36).toUpperCase()}`;

  try {
    const customer = await customerRepository.create({
      businessId: user.businessId,
      customerNumber,
      customerType: "INDIVIDUAL",
      firstName,
      lastName: parsed.data.lastName?.trim() || null,
      phone,
      active: true,
    });

    return {
      success: true as const,
      customerId: customer.id,
      created: true as const,
      displayName: [customer.firstName, customer.lastName]
        .filter(Boolean)
        .join(" "),
      phone: customer.phone ?? phone,
    };
  } catch (error) {
    return {
      success: false as const,
      message:
        error instanceof Error ? error.message : "Could not save customer.",
    };
  }
}
