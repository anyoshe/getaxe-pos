"use server";

import { z } from "zod";

import { requireAuthorizedUser } from "@/lib/auth/authorize";
import { customerRepository } from "@/repositories/sales/customer.repository";
import { loyaltyService } from "../services/loyalty.service";

function normalizePhone(phone: string) {
  return phone.replace(/[\s\-()]/g, "").trim();
}

/**
 * Look up a registered customer by phone (loyalty / rewards key).
 * Returns points balance and program earn preview for POS.
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
      message:
        "No member with that number — sale can continue without points, or capture name for the receipt.",
    };
  }

  const program = await loyaltyService
    .getOrCreateProgram(user.businessId)
    .catch(() => null);

  return {
    success: true as const,
    found: true as const,
    customer: {
      id: customer.id,
      firstName: customer.firstName,
      lastName: customer.lastName,
      phone: customer.phone,
      customerNumber: customer.customerNumber,
      loyaltyPoints: Number(customer.loyaltyPoints ?? 0),
      displayName: [customer.firstName, customer.lastName]
        .filter(Boolean)
        .join(" "),
    },
    program: program
      ? {
          active: program.active,
          amountPerPointUnit: Number(program.amountPerPointUnit) || 100,
          pointsPerAmount: Number(program.pointsPerAmount) || 1,
          name: program.name,
        }
      : null,
  };
}

/** Points that would be earned on a cart total under current program rules */
export async function previewLoyaltyEarnAction(saleTotal: number) {
  const user = await requireAuthorizedUser("sales.create");
  const program = await loyaltyService.getOrCreateProgram(user.businessId);
  if (!program.active) {
    return { success: true as const, points: 0, active: false as const };
  }
  const unit = Number(program.amountPerPointUnit) || 100;
  const per = Number(program.pointsPerAmount) || 1;
  const points = Math.floor((Number(saleTotal) / unit) * per);
  return {
    success: true as const,
    points: Math.max(0, points),
    active: true as const,
    unit,
    per,
  };
}

/**
 * Find by phone or create a light customer record (POS capture).
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
      loyaltyPoints: Number(existing.loyaltyPoints ?? 0),
    };
  }

  const firstName = parsed.data.firstName?.trim() || "Customer";
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
      loyaltyPoints: 0,
    };
  } catch (error) {
    return {
      success: false as const,
      message:
        error instanceof Error ? error.message : "Could not save customer.",
    };
  }
}
