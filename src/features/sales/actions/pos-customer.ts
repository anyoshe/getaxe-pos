"use server";

import { and, desc, eq, sql } from "drizzle-orm";
import { z } from "zod";

import { db } from "@/db";
import { customers } from "@/db/schema/sales/customers";
import { sales } from "@/db/schema/sales/sales";
import { requireAuthorizedUser } from "@/lib/auth/authorize";
import { customerRepository } from "@/repositories/sales/customer.repository";
import { loyaltyService } from "../services/loyalty.service";

function normalizePhone(phone: string) {
  return phone.replace(/[\s\-()]/g, "").trim();
}

function customerDisplay(c: {
  customerType?: string | null;
  companyName?: string | null;
  tradingName?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  contactPersonTitle?: string | null;
}) {
  const isBiz = c.customerType === "BUSINESS";
  const person = [c.firstName, c.lastName].filter(Boolean).join(" ");
  // Prefer legal company name, then trading name — never registration number
  const company =
    (c.companyName && c.companyName.trim()) ||
    (c.tradingName && c.tradingName.trim()) ||
    "";
  if (isBiz) {
    return {
      displayName: company || person || "Business customer",
      contactName: person || null,
      isBusiness: true as const,
    };
  }
  return {
    displayName: person || company || "Customer",
    contactName: null as string | null,
    isBusiness: false as const,
  };
}

/** Customers available on POS (picker). Credit-enabled sorted first when credit mode. */
export async function listPosCustomersAction() {
  const user = await requireAuthorizedUser("sales.create");
  const rows = await db
    .select({
      id: customers.id,
      customerType: customers.customerType,
      companyName: customers.companyName,
      tradingName: customers.tradingName,
      firstName: customers.firstName,
      lastName: customers.lastName,
      phone: customers.phone,
      allowCredit: customers.allowCredit,
      creditLimit: customers.creditLimit,
      loyaltyPoints: customers.loyaltyPoints,
      contactPersonTitle: customers.contactPersonTitle,
    })
    .from(customers)
    .where(
      and(eq(customers.businessId, user.businessId), eq(customers.active, true)),
    )
    .orderBy(desc(customers.createdAt))
    .limit(300);

  return {
    success: true as const,
    customers: rows.map((c) => {
      const d = customerDisplay(c);
      return {
        id: c.id,
        ...d,
        phone: c.phone,
        allowCredit: Boolean(c.allowCredit),
        creditLimit: Number(c.creditLimit ?? 0),
        loyaltyPoints: Number(c.loyaltyPoints ?? 0),
        customerType: c.customerType,
        companyName: c.companyName,
        contactPersonTitle: c.contactPersonTitle,
      };
    }),
  };
}

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
        "No member with that number — sale can continue; name + phone will be saved as a new customer on cash sale.",
    };
  }

  const program = await loyaltyService
    .getOrCreateProgram(user.businessId)
    .catch(() => null);

  const d = customerDisplay(customer as any);

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
      companyName: (customer as any).companyName ?? null,
      customerType: (customer as any).customerType ?? "INDIVIDUAL",
      allowCredit: Boolean((customer as any).allowCredit),
      creditLimit: Number((customer as any).creditLimit ?? 0),
      ...d,
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
 * Find by phone or create a light customer record (POS capture / cash sale auto-add).
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
      message: "Phone is required to save a customer.",
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

    const d = customerDisplay(existing as any);
    return {
      success: true as const,
      customerId: existing.id,
      created: false as const,
      ...d,
      phone: existing.phone ?? phone,
      loyaltyPoints: Number(existing.loyaltyPoints ?? 0),
      companyName: (existing as any).companyName ?? null,
      customerType: (existing as any).customerType ?? "INDIVIDUAL",
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
      allowCredit: false,
      creditLimit: "0",
    } as any);

    return {
      success: true as const,
      customerId: customer.id,
      created: true as const,
      displayName: [customer.firstName, customer.lastName]
        .filter(Boolean)
        .join(" "),
      contactName: null as string | null,
      isBusiness: false as const,
      phone: customer.phone ?? phone,
      loyaltyPoints: 0,
      companyName: null as string | null,
      customerType: "INDIVIDUAL",
    };
  } catch (error) {
    return {
      success: false as const,
      message:
        error instanceof Error ? error.message : "Could not save customer.",
    };
  }
}

/** Open AR balance for a customer (pending/partial sales). */
export async function getCustomerCreditExposureAction(customerId: string) {
  const user = await requireAuthorizedUser("sales.create");
  const [row] = await db
    .select({
      openBalance: sql<string>`coalesce(sum(${sales.balanceDue}::numeric), 0)`,
      creditLimit: customers.creditLimit,
      allowCredit: customers.allowCredit,
    })
    .from(sales)
    .rightJoin(customers, eq(customers.id, customerId))
    .where(
      and(
        eq(customers.businessId, user.businessId),
        eq(customers.id, customerId),
        sql`(${sales.id} is null or (${sales.businessId} = ${user.businessId} and ${sales.paymentStatus} in ('PENDING','PARTIAL')))`,
      ),
    )
    .groupBy(customers.id, customers.creditLimit, customers.allowCredit);

  // Simpler query without join issues:
  const [cust] = await db
    .select({
      creditLimit: customers.creditLimit,
      allowCredit: customers.allowCredit,
    })
    .from(customers)
    .where(
      and(
        eq(customers.id, customerId),
        eq(customers.businessId, user.businessId),
      ),
    )
    .limit(1);

  if (!cust) {
    return { success: false as const, message: "Customer not found." };
  }

  const [bal] = await db
    .select({
      openBalance: sql<string>`coalesce(sum(${sales.balanceDue}::numeric), 0)`,
    })
    .from(sales)
    .where(
      and(
        eq(sales.businessId, user.businessId),
        eq(sales.customerId, customerId),
        sql`${sales.paymentStatus} in ('PENDING','PARTIAL')`,
      ),
    );

  const openBalance = Number(bal?.openBalance ?? 0);
  const creditLimit = Number(cust.creditLimit ?? 0);
  return {
    success: true as const,
    openBalance,
    creditLimit,
    allowCredit: Boolean(cust.allowCredit),
    available: Math.max(0, creditLimit - openBalance),
  };
}
