import { requirePageAccess } from "@/lib/auth/authorize";

import { getUnits } from "@/features/settings/actions/units";

import { UnitsClient } from "@/features/settings/components/units-client";

export default async function Page() {
  const user = await requirePageAccess("units.view");

  const units = await getUnits(user.businessId);

  return <UnitsClient units={units} />;
}
