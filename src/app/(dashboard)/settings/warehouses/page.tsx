import { requirePageAccess } from "@/lib/auth/authorize";

import {
  getBranches,
} from "@/features/settings/actions/branches";

import {
  getWarehouses,
} from "@/features/settings/actions/warehouses";

import {
  WarehousesClient,
} from "@/features/settings/components/warehouses-client";

export default async function Page() {

  const user =
    await requirePageAccess("warehouses.view");

  const [
    warehouses,
    branches,
  ] = await Promise.all([
    getWarehouses(
      user.businessId
    ),
    getBranches(
      user.businessId
    ),
  ]);

  return (
    <WarehousesClient
      warehouses={warehouses}
      branches={branches}
    />
  );
}