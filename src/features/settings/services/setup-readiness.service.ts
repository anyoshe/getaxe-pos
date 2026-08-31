import { eq, isNull, or, sql } from "drizzle-orm";

import { db } from "@/db";
import { products } from "@/db/schema/inventory/products";
import { inventoryBalances } from "@/db/schema/inventory/inventory_balances";
import { cashAccounts } from "@/db/schema/finance/cash_accounts";
import { taxRates } from "@/db/schema/finance/tax_rates";
import { units } from "@/db/schema/settings/units";
import { businesses } from "@/db/schema/core/businesses";
import { sales } from "@/db/schema/sales/sales";
import { BusinessCapabilityRepository } from "@/features/capabilities/repositories";
import { branchesRepository } from "@/repositories/settings/branches.repository";
import { warehousesRepository } from "@/repositories/settings/warehouses.repository";
import { supplierRepository } from "@/repositories/inventory/suppliers.repository";

export type SetupCheck = {
  id: string;
  label: string;
  description?: string;
  done: boolean;
  href: string;
  priority: number;
  /** Optional checks don't reduce score when incomplete */
  optional?: boolean;
};

export async function getSetupReadiness(
  businessId: string,
): Promise<{ score: number; checks: SetupCheck[]; requiredDone: number; requiredTotal: number }> {
  const [
    business,
    branches,
    warehouses,
    productCount,
    stockLines,
    suppliers,
    unitRows,
    cashRows,
    taxRows,
    saleCount,
    caps,
  ] = await Promise.all([
    db
      .select({
        name: businesses.name,
        businessType: businesses.businessType,
      })
      .from(businesses)
      .where(eq(businesses.id, businessId))
      .limit(1)
      .then((r) => r[0] ?? null)
      .catch(() => null),
    branchesRepository.findAll(businessId).catch(() => []),
    warehousesRepository.findAll(businessId).catch(() => []),
    db
      .select({ c: sql<number>`count(*)::int` })
      .from(products)
      .where(eq(products.businessId, businessId))
      .then((r) => Number(r[0]?.c ?? 0))
      .catch(() => 0),
    db
      .select({ c: sql<number>`count(*)::int` })
      .from(inventoryBalances)
      .where(
        sql`${inventoryBalances.businessId} = ${businessId} AND ${inventoryBalances.quantity}::numeric > 0`,
      )
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
    db
      .select({ c: sql<number>`count(*)::int` })
      .from(sales)
      .where(eq(sales.businessId, businessId))
      .then((r) => Number(r[0]?.c ?? 0))
      .catch(() => 0),
    new BusinessCapabilityRepository().listEnabled(businessId).catch(() => []),
  ]);

  const hasPharmacy = caps.includes("pharmacy.core") || caps.includes("pharmacy.medicine-catalogue");
  const hasSerial = caps.includes("inventory.serial-numbers");
  const hasCycle = caps.includes("inventory.cycle-count");
  const hasPromo = caps.includes("inventory.promotional-pricing");
  const hasDispense = caps.includes("pharmacy.dispensing");

  const checks: SetupCheck[] = [
    {
      id: "profile",
      label: "Business profile",
      description: "Name and type confirmed for this organisation",
      done: Boolean(business?.name?.trim()),
      href: "/settings/business",
      priority: 1,
    },
    {
      id: "branch",
      label: "Branch",
      description: "At least one selling / operating location",
      done: branches.length > 0,
      href: "/settings/branches",
      priority: 2,
    },
    {
      id: "warehouse",
      label: "Warehouse",
      description: "Stock location linked for receiving and POS",
      done: warehouses.length > 0,
      href: "/settings/warehouses",
      priority: 3,
    },
    {
      id: "caps",
      label: "Capabilities reviewed",
      description: "Enable serials, pharmacy, promos, cycle count as needed",
      done: caps.length > 0,
      href: "/settings/capabilities",
      priority: 4,
    },
    {
      id: "units",
      label: "Units of measure",
      description: "Piece, box, kg, etc. for multi-unit products",
      done: unitRows > 0,
      href: "/settings/units",
      priority: 5,
    },
    {
      id: "cash",
      label: "Cash / bank till",
      description: "Required so POS payments post correctly",
      done: cashRows > 0,
      href: "/finance/cash-accounts",
      priority: 6,
    },
    {
      id: "tax",
      label: "Tax rates",
      description: "VAT or exempt rates for invoices",
      done: taxRows > 0,
      href: "/finance/tax-rates",
      priority: 7,
    },
    {
      id: "product",
      label: "Product catalogue",
      description: "At least one product (manual or CSV import)",
      done: productCount > 0,
      href: "/inventory/products",
      priority: 8,
    },
    {
      id: "stock",
      label: "Opening stock or GRN",
      description: "Positive on-hand balances for sellable items",
      done: stockLines > 0,
      href: "/inventory/stock/receive",
      priority: 9,
    },
    {
      id: "supplier",
      label: "Supplier (purchasing)",
      description: "Needed for purchase orders and GRN",
      done: suppliers.length > 0,
      href: "/inventory/suppliers",
      priority: 10,
      optional: true,
    },
    {
      id: "sale",
      label: "First POS sale",
      description: "Confirms till, stock, and pricing end-to-end",
      done: saleCount > 0,
      href: "/sales/pos",
      priority: 11,
      optional: true,
    },
    {
      id: "pharmacy_hint",
      label: "Pharmacy catalogues",
      description: "Dosage forms & drug categories for medicine products",
      done: !hasPharmacy || productCount > 0,
      href: "/inventory/pharmacy-catalogues",
      priority: 12,
      optional: true,
    },
    {
      id: "serial_hint",
      label: "Serialised products",
      description: "Toggle Serialized on products that need serial capture",
      done: !hasSerial || productCount > 0,
      href: "/inventory/products",
      priority: 13,
      optional: true,
    },
    {
      id: "cycle_hint",
      label: "Cycle counts available",
      description: "Inventory → Cycle counts when capability is on",
      done: !hasCycle || hasCycle,
      href: "/inventory/cycle-counts",
      priority: 14,
      optional: true,
    },
    {
      id: "promo_hint",
      label: "Promotions (optional)",
      description: "Define retail promos under Inventory → Promotions",
      done: !hasPromo || hasPromo,
      href: "/inventory/promotions",
      priority: 15,
      optional: true,
    },
    {
      id: "dispense_hint",
      label: "Dispensing screen",
      description: "Pharmacy → Dispensing for walk-in medicine issue",
      done: !hasDispense || hasDispense,
      href: "/pharmacy/dispensing",
      priority: 16,
      optional: true,
    },
  ];

  const required = checks.filter((c) => !c.optional);
  const requiredDone = required.filter((c) => c.done).length;
  const requiredTotal = required.length;
  const score =
    requiredTotal === 0
      ? 100
      : Math.round((requiredDone / requiredTotal) * 100);

  return { score, checks, requiredDone, requiredTotal };
}
