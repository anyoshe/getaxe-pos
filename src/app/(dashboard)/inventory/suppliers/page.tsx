import {
  getCurrentUser,
} from "@/lib/auth/current-user";

import {
  supplierService,
} from "@/features/inventory/services";

import {
  SuppliersClient,
} from "@/features/inventory/components/suppliers";

export default async function Page() {
  const user =
    await getCurrentUser();

  if (!user) {
    return null;
  }

  const suppliers =
    await supplierService.getSuppliers(
      user.businessId
    );

  return (
    <SuppliersClient
      suppliers={suppliers}
    />
  );
}
