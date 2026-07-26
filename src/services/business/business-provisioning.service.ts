import { provisionBusiness } from "@/db/seed/business/provision-business";
import { provisionBranch } from "@/db/seed/business/provision-branch";
import { provisionWarehouse } from "@/db/seed/business/provision-warehouse";
import { provisionFiscalYear } from "@/db/seed/business/provision-fiscal-year";
import { provisionBusinessSettings } from "@/db/seed/business/provision-business-settings";
import { provisionNumberingSequences } from "@/db/seed/business/provision-numbering-sequences";
import { seedAdmin } from "@/db/seed/system/admin";


type ProvisionBusinessInput = {

  businessName?: string;

  adminName?: string;

  adminEmail?: string;

  adminPassword?: string;

};


export async function provisionCompleteBusiness(
  input?: ProvisionBusinessInput
) {

  console.log(
    "Starting complete business provisioning..."
  );


  //
  // 1. Create business
  //

  const business =
    await provisionBusiness();


  //
  // 2. Create branch
  //

  const branch =
    await provisionBranch(
      business.id
    );


  //
  // 3. Create warehouse
  //

  await provisionWarehouse(
    business.id,
    branch.id
  );


  //
  // 4. Create fiscal year
  //

  await provisionFiscalYear(
    business.id
  );


  //
  // 5. Create business settings
  //

  await provisionBusinessSettings(
    business.id
  );


  //
  // 6. Create numbering sequences
  //

  await provisionNumberingSequences(
    business.id,
    branch.id
  );


  //
  // 7. Create administrator
  //

  await seedAdmin(
    business.id
  );


  console.log(
    "Business provisioning completed successfully."
  );


  return business;

}