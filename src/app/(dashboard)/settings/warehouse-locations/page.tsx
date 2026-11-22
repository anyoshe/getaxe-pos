import { requirePageAccess } from "@/lib/auth/authorize";
export default async function WarehouseLocationsPage() {
  await requirePageAccess("warehouses.view");

  return (
    <div>
      Warehouse Locations Page
    </div>
  );
}