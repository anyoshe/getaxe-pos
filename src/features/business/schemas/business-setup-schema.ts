import { z } from "zod";

import {
  BUSINESS_TYPE_VALUES,
} from "../constants/business-types";

export const businessSetupSchema = z.object({

  // =====================
  // Business Information
  // =====================

  name: z
    .string()
    .trim()
    .min(2, "Business name is required"),

  legalName: z
    .string()
    .trim()
    .optional(),

  registrationNumber: z
    .string()
    .trim()
    .optional(),

  kraPin: z
    .string()
    .trim()
    .optional(),

  businessType:
    z.enum(BUSINESS_TYPE_VALUES),

  // =====================
  // Business Contact
  // =====================

  phone: z
    .string()
    .trim()
    .optional(),

  email: z
    .email()
    .optional()
    .or(z.literal("")),

  website: z
    .string()
    .trim()
    .optional(),

  // =====================
  // Location
  // =====================

  country: z
    .string()
    .default("Kenya"),

  county: z
    .string()
    .trim()
    .optional(),

  town: z
    .string()
    .trim()
    .optional(),

  address: z
    .string()
    .trim()
    .optional(),

  // =====================
  // Preferences
  // =====================

  currency: z
    .string()
    .default("KES"),

  timezone: z
    .string()
    .default("Africa/Nairobi"),

});

export type BusinessSetupInput =
  z.infer<typeof businessSetupSchema>;