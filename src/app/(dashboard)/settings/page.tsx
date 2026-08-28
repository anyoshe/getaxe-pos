import { getCurrentUser } from "@/lib/auth/current-user";
import { SettingsHub } from "@/features/settings/components/settings-hub";
import { branchesRepository } from "@/repositories/settings/branches.repository";
import { warehousesRepository } from "@/repositories/settings/warehouses.repository";
import { userRepository } from "@/repositories/users/user.repository";
import { unitsRepository } from "@/repositories/settings/units.repository";

export default async function SettingsPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const [branches, warehouses, users, units] = await Promise.all([
    branchesRepository.count(user.businessId).catch(() => 0),
    warehousesRepository.count(user.businessId).catch(() => 0),
    userRepository.count(user.businessId).catch(() => 0),
    unitsRepository.findAll(user.businessId).then((u) => u.length).catch(() => 0),
  ]);

  return (
    <SettingsHub
      summary={{
        branches: Number(branches),
        warehouses: Number(warehouses),
        users: Number(users),
        units: Number(units),
      }}
    />
  );
}
