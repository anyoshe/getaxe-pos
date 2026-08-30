import { businessService } from "./business.service";

import {
  branchesService,
  warehousesService,
  fiscalYearsService,
  businessSettingsService,
  numberingSequencesService,
} from "@/features/settings/services";

import { businessCapabilityService } from "@/features/capabilities/services";
import { ensureFinanceDefaults } from "@/features/finance/services/finance.service";
import { seedPharmacyCataloguesForBusiness } from "@/features/pharmacy/services/seed-pharmacy-catalogues.service";
import { seedDefaultProductCategories } from "@/features/inventory/services/seed-default-product-categories.service";

import type { BusinessType } from "../constants/business-types";

import { userService, roleService } from "@/features/users/services";

import { businessOwnerService } from "@/features/platform/services";

import { userInvitationsRepository } from "@/repositories";

export interface ProvisionBusinessInput {
  name: string;

  legalName?: string;

  registrationNumber?: string;

  kraPin?: string;

  businessType: BusinessType;

  email?: string;

  phone?: string;

  website?: string;

  country?: string;

  county?: string;

  town?: string;

  address?: string;

  currency?: string;

  timezone?: string;

  logo?: string;

  //
  // Platform Business Owner
  //

  ownerUserId: string;

  ownerInvitationId: string;

  ownerName: string;

  ownerEmail: string;

  ownerPhone?: string;

  ownerPasswordHash: string;
}

export class BusinessProvisioningService {
  async provision(input: ProvisionBusinessInput) {
    //
    // Step 1
    // Create Business
    //

    const business = await businessService.createBusiness({
      name: input.name,

      legalName: input.legalName,

      registrationNumber: input.registrationNumber,

      kraPin: input.kraPin,

      businessType: input.businessType,

      email: input.email,

      phone: input.phone,

      website: input.website,

      country: input.country ?? "Kenya",

      county: input.county,

      town: input.town,

      address: input.address,

      currency: input.currency ?? "KES",

      timezone: input.timezone ?? "Africa/Nairobi",

      logo: input.logo,

      active: true,
    });

    //
    // Step 2
    // Create Head Office Branch
    //

    const branch = await branchesService.createBranch({
      businessId: business.id,

      code: "MAIN",

      name: "Main Branch",

      phone: input.phone,

      email: input.email,

      county: input.county,

      town: input.town,

      address: input.address,

      active: true,

      isHeadOffice: true,
    });

    //
    // Step 3
    // Create Main Warehouse
    //

    await warehousesService.createWarehouse({
      businessId: business.id,

      branchId: branch.id,

      code: "MAIN",

      name: "Main Warehouse",

      description: "Default business warehouse",

      active: true,
    });

    //
    // Step 4
    // Create Fiscal Year
    //

    await fiscalYearsService.createCurrentFiscalYear(business.id);

    //
    // Step 5
    // Create Business Settings
    //

    await businessSettingsService.createDefaultSettings(business.id);

    //
    // Step 6
    // Create Numbering Sequences
    //

    await numberingSequencesService.createDefaultSequences(
      business.id,
      branch.id,
    );

    //
    // Step 7
    // Provision Business Capabilities
    //

    await businessCapabilityService.provision(
      business.id,

      input.businessType,
    );

    //
    // Step 7b
    // Pharmacy / clinic default catalogues (dosage forms, categories, strengths, Rx types)
    //
    await seedPharmacyCataloguesForBusiness(business.id, input.businessType);

    // Product Category dropdown (inventory.categories) — separate from drug categories
    await seedDefaultProductCategories(business.id, input.businessType);

    //
    // Step 7c — Chart of accounts, cash accounts, tax defaults
    //
    await ensureFinanceDefaults(business.id);

    //
    // Step 8
    // Load Administrator Role
    //

    const adminRole = await roleService.getSystemRoleByName("ADMINISTRATOR");

    if (!adminRole) {
      throw new Error("Administrator role not found.");
    }

    //
    // Step 9
    // Create ERP Owner
    //

    const owner = await userService.createUserFromPlatform({
      businessId: business.id,

      roleId: adminRole.id,

      name: input.ownerName,

      email: input.ownerEmail,

      phone: input.ownerPhone,

      passwordHash: input.ownerPasswordHash,

      active: true,
    });

    if (!owner) {
      throw new Error("Failed to create ERP owner.");
    }

    //
    // Step 10
    // Link ERP Owner
    //

    await businessService.updateBusiness(business.id, {
      createdBy: owner.id,
    });

    //
    // Step 11
    // Link Platform User
    //

    await businessOwnerService.updateBusinessOwner(
      input.ownerUserId,

      {
        businessId: business.id,
      },
    );

    //
    // Step 12
    // Complete Invitation
    //

    await userInvitationsRepository.updateStatus(
      input.ownerInvitationId,
      "COMPLETED",
    );

    //
    // Done — return owner + admin role so session can be created correctly
    //

    return {
      business,
      owner,
      adminRoleId: adminRole.id,
    };
  }
}

export const businessProvisioningService = new BusinessProvisioningService();
