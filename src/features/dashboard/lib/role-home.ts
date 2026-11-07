/**
 * Maps system (and common custom) role names to a home experience.
 * Custom roles fall back to "staff" unless their name matches a known pattern.
 */

export type RoleHomeKind =
  | "owner"
  | "cashier"
  | "accountant"
  | "store"
  | "purchasing"
  | "pharmacist"
  | "sales"
  | "staff";

export type RoleHomeConfig = {
  kind: RoleHomeKind;
  /** Short label for the home header */
  title: string;
  description: string;
  /** Primary CTA path */
  primaryHref: string;
  primaryLabel: string;
  /** Whether to load the full owner dashboard payload */
  loadOwnerDashboard: boolean;
  /** Show the daily owner brief strip */
  showOwnerBrief: boolean;
};

const OWNER_NAMES = new Set([
  "ADMINISTRATOR",
  "BUSINESS_OWNER",
  "MANAGER",
  "SUPER_ADMIN",
  "ADMIN",
  "OWNER",
]);

const CASHIER_NAMES = new Set(["CASHIER", "TELLER"]);
const ACCOUNTANT_NAMES = new Set([
  "ACCOUNTANT",
  "FINANCE",
  "BOOKKEEPER",
]);
const STORE_NAMES = new Set([
  "STORE_KEEPER",
  "STOREKEEPER",
  "STOCK_CONTROLLER",
  "STOCKCONTROLLER",
  "INVENTORY",
  "INVENTORY_CONTROLLER",
  "WAREHOUSE",
  "WAREHOUSE_MANAGER",
]);
const PURCHASING_NAMES = new Set([
  "PURCHASING_OFFICER",
  "PURCHASING",
  "BUYER",
  "PROCUREMENT",
  "PROCUREMENT_OFFICER",
]);
const PHARMACIST_NAMES = new Set([
  "PHARMACIST",
  "PHARMACY",
  "DISPENSER",
]);
const SALES_NAMES = new Set([
  "SALES_PERSON",
  "SALES",
  "SALESPERSON",
]);

function normalize(name: string | null | undefined): string {
  return (name ?? "")
    .trim()
    .toUpperCase()
    .replace(/[\s-]+/g, "_");
}

export function resolveRoleHome(
  roleName: string | null | undefined,
): RoleHomeConfig {
  const n = normalize(roleName);

  if (OWNER_NAMES.has(n) || n.includes("OWNER") || n.includes("ADMIN")) {
    return {
      kind: "owner",
      title: "Your business today",
      description:
        "Sales, stock, cash and what needs attention — decide with facts even when you are not at the counter.",
      primaryHref: "/sales/pos",
      primaryLabel: "Open POS",
      loadOwnerDashboard: true,
      showOwnerBrief: true,
    };
  }

  if (CASHIER_NAMES.has(n)) {
    return {
      kind: "cashier",
      title: "Cashier station",
      description:
        "Sell, take payment, and keep the till moving. Open POS when a customer is ready.",
      primaryHref: "/sales/pos",
      primaryLabel: "Open POS",
      loadOwnerDashboard: true,
      showOwnerBrief: false,
    };
  }

  if (ACCOUNTANT_NAMES.has(n)) {
    return {
      kind: "accountant",
      title: "Finance desk",
      description:
        "Cash, payables, receivables, journals and end-of-day reconciliation.",
      primaryHref: "/finance/cash-accounts",
      primaryLabel: "Cash & bank",
      loadOwnerDashboard: true,
      showOwnerBrief: false,
    };
  }

  if (
    STORE_NAMES.has(n) ||
    n.includes("STORE") ||
    n.includes("STOCK") ||
    n.includes("WAREHOUSE") ||
    n.includes("INVENTORY")
  ) {
    return {
      kind: "store",
      title: "Stock desk",
      description:
        "Receive, transfer, adjust and act on reorder alerts so the counter never runs dry — even if the owner has not flagged them yet.",
      primaryHref: "/dashboard/attention?kind=restock",
      primaryLabel: "Reorder alerts",
      loadOwnerDashboard: true,
      showOwnerBrief: false,
    };
  }

  if (
    PURCHASING_NAMES.has(n) ||
    n.includes("PURCHAS") ||
    n.includes("PROCURE") ||
    n.includes("BUYER")
  ) {
    return {
      kind: "purchasing",
      title: "Purchasing desk",
      description:
        "Reorder alerts, purchase orders, goods receipt and supplier invoices — keep shelves full without waiting on the owner.",
      primaryHref: "/dashboard/attention?kind=restock",
      primaryLabel: "What to reorder",
      loadOwnerDashboard: true,
      showOwnerBrief: false,
    };
  }

  if (PHARMACIST_NAMES.has(n)) {
    return {
      kind: "pharmacist",
      title: "Pharmacy desk",
      description:
        "Dispense, control register, and sell with batch and expiry in mind.",
      primaryHref: "/sales/pos",
      primaryLabel: "Open POS",
      loadOwnerDashboard: true,
      showOwnerBrief: false,
    };
  }

  if (SALES_NAMES.has(n)) {
    return {
      kind: "sales",
      title: "Sales desk",
      description:
        "Quotations, orders, invoices and the counter — close the sale.",
      primaryHref: "/sales/pos",
      primaryLabel: "Open POS",
      loadOwnerDashboard: true,
      showOwnerBrief: false,
    };
  }

  return {
    kind: "staff",
    title: "Home",
    description: "Quick links for your role. Ask an admin if something is missing.",
    primaryHref: "/dashboard",
    primaryLabel: "Refresh",
    loadOwnerDashboard: true,
    showOwnerBrief: false,
  };
}
