import {
  getCurrentUser,
} from "@/lib/auth/current-user";

import {
  getBranches,
} from "@/features/settings/actions";

import {
  BranchesClient,
} from "@/features/settings/components/branches-client";


export default async function Page() {

  const user =
    await getCurrentUser();


  if (!user) {
    return null;
  }


  const branches =
    await getBranches(
      user.businessId
    );


  return (
    <BranchesClient
      branches={branches}
    />
  );
}