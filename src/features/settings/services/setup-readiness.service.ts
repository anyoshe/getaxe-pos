import { eq, isNull, or, sql } from "drizzle-orm";

import { db } from "@/db";
import { products } from "@/db/schema/inventory/products";
import { cashAccounts } from "@/db/schema/finance/cash_accounts";
import { taxRates } from "@/db/schema/finance/tax_rates";
import { units } from "@/db/schema/settings/units";
import { BusinessCapabilityRepository } from "@/features/capabilities/repositories";
import { branchesRepository } from "@/repositories/settings/branches.repository";
import { warehousesRepository } from "@/repositories/settings/warehouses.repository";
import { supplierRepository } from "@/repositories/inventory/suppliers.repository";

export type SetupCheck = {
  id: string;
  label: string;
  done: boolean;
  href: string;
  priority: number;
};

export async function getSetupReadiness(
  businessId: string,
): Promise<{ score: number; checks: SetupCheck[] }> {
  const [
    branches,
    warehouses,
    productCount,
    suppliers,
    unitRows,
    cashRows,
    taxRows,
    caps,
  ] = await Promise.all([
    branchesRepository.findAll(businessId).catch(() => []),
    warehousesRepository.findAll(businessId).catch(() => []),
    db
      .select({ c: sql<number>`count(*)::int` })
      .from(products)
      .where(eq(products.businessId, businessId))
      .then((r) => Number(r[0]?.c ?? 0))
      .catch(() => 0),
    supplierRepository.findAll(businessId).catch(() => []),
    db
      .select({ c: sql<number>`count(*)::int` })
      .from(units)
      .where(or(isNull(units.businessId), eq(units.businessId, businessId)))
      .then((r) => Number(r[0]?.c ?? 0))
      .catch(() => 0),
    db
      .select({ c: sql<number>`count(*)::int` })
      .from(cashAccounts)
      .where(eq(cashAccounts.businessId, businessId))
      .then((r) => Number(r[0]?.c ?? 0))
      .catch(() => 0),
    db
      .select({ c: sql<number>`count(*)::int` })
      .from(taxRates)
      .where(eq(taxRates.businessId, businessId))
      .then((r) => Number(r[0]?.c ?? 0))
      .catch(() => 0),
    new BusinessCapabilityRepository().listEnabled(businessId).catch(() => []),
  ]);

  const checks: SetupCheck[] = [
    {
      id: "branch",
      label: "At least one branch",
      done: branches.length > 0,
      href: "/settings/branches",
      priority: 1,
    },
    {
      id: "warehouse",
      label: "At least one warehouse",
      done: warehouses.length > 0,
      href: "/settings/warehouses",
      priority: 2,
    },
    {
      id: "units",
      label: "Units of measure configured",
      done: unitRows > 0,
      href: "/settings/units",
      priority: 3,
    },
    {
      id: "cash",
      label: "Cash / bank till for POS",
      done: cashRows > 0,
      href: "/finance/cash-accounts",
      priority: 4,
    },
    {
      id: "tax",
      label: "Tax rates available",
      done: taxRows > 0,
      href: "/finance/tax-rates",
      priority: 5,
    },
    {
      id: "product",
      label: "At least one product",
      done: productCount > 0,
      href: "/inventory/products",
      priority: 6,
    },
    {
      id: "supplier",
      label: "Supplier for purchasing (optional)",
      done: suppliers.length > 0,
      href: "/inventory/suppliers",
      priority: 7,
    },
    {
      id: "caps",
      label: "Business capabilities reviewed",
      done: caps.length > 0,
      href: "/settings/capabilities",
      priority: 8,
    },
  ];

  const required = checks.filter((c) => c.id !== "supplier");
  const done = required.filter((c) => c.done).length;
  const score = Math.round((done / required.length) * 100);

  return { score, checks };
}
