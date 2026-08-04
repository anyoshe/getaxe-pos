import { businessService } from "./business.service";

import { branchesService } from "@/features/settings/services";

import { warehousesService } from "@/features/settings/services";

import { fiscalYearsService } from "@/features/settings/services";

import { businessSettingsService } from "@/features/settings/services";

import { numberingSequencesService } from "@/features/settings/services";
import { userService, roleService } from "@/features/users/services";

export interface ProvisionBusinessInput {
  name: string;

  legalName?: string;

  registrationNumber?: string;

  kraPin?: string;

  businessType:
    "RETAIL" | "WHOLESALE" | "PHARMACY" | "CHEMIST" | "CLINIC" | "HOSPITAL";

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
  
  ownerUserId: string;
}

export class BusinessProvisioningService {
  async provision(input: ProvisionBusinessInput) {
    //
    // Step 1
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
    // Create default numbering sequences
    //

    await numberingSequencesService.createDefaultSequences(
      business.id,
      branch.id,
    );
    //
// Step 7
// Assign business owner
//

const adminRole =
  await roleService.getSystemRoleByName(
    "ADMINISTRATOR",
  );

if (!adminRole) {
  throw new Error(
    "Administrator role not found.",
  );
}

const owner =
  await userService.updateUser(
    input.ownerUserId,
    {
      businessId: business.id,
      roleId: adminRole.id,
    },
  );

if (!owner) {
  throw new Error(
    "Business owner not found.",
  );
}

//
// Step 8
// Link creator to business
//

await businessService.updateBusiness(
  business.id,
  {
    createdBy: owner.id,
  },
);

return business;

  }

}

export const businessProvisioningService = new BusinessProvisioningService();
