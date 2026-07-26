import {
  getCurrentUser,
} from "@/lib/auth/current-user";

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
    await getCurrentUser();

  if (!user) {
    return null;
  }

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