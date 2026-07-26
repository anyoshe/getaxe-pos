import {
  getCurrentUser,
} from "@/lib/auth/current-user";

import {
  getUnits,
} from "@/features/settings/actions/units";

import {
  UnitsClient,
} from "@/features/settings/components/units-client";


export default async function Page() {

  const user =
    await getCurrentUser();


  if (!user) {
    return null;
  }


  const units =
    await getUnits(
      user.businessId
    );


  return (
    <UnitsClient
      units={units}
    />
  );
}