import { requirePageAccess } from "@/lib/auth/authorize";

import { getBranches } from "@/features/settings/actions";

import { BranchesClient } from "@/features/settings/components/branches-client";

export default async function Page() {
  const user = await requirePageAccess("branches.view");

  const branches = await getBranches(user.businessId);

  return <BranchesClient branches={branches} />;
}
