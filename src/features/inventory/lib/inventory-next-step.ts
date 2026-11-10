/**
 * State-based inventory guidance for new shops.
 * Soft directions only — never a second full wizard parallel to go-live.
 */

export type InventoryGuidePhase =
  | "catalogue"
  | "stock"
  | "sell"
  | "ready";

export type InventoryGuideLink = {
  href: string;
  label: string;
};

export type InventoryGuide = {
  phase: InventoryGuidePhase;
  title: string;
  detail: string;
  /** Primary action */
  primary: InventoryGuideLink;
  /** Optional alternate paths */
  secondary: InventoryGuideLink[];
  /** Tiny progress labels Catalogue → Stock → Sell */
  steps: { id: InventoryGuidePhase; label: string; status: "done" | "current" | "todo" }[];
};

export function resolveInventoryGuide(input: {
  productCount: number;
  categoryCount: number;
  /** Sum of on-hand quantities across warehouses */
  totalStockQty: number;
  /** Completed sales ever (or recent); 0 means no first sale yet */
  completedSaleCount: number;
}): InventoryGuide {
  const products = Math.max(0, Number(input.productCount) || 0);
  const categories = Math.max(0, Number(input.categoryCount) || 0);
  const stockQty = Math.max(0, Number(input.totalStockQty) || 0);
  const sales = Math.max(0, Number(input.completedSaleCount) || 0);

  const stepStatus = (
    id: InventoryGuidePhase,
    current: InventoryGuidePhase,
  ): "done" | "current" | "todo" => {
    const order: InventoryGuidePhase[] = ["catalogue", "stock", "sell", "ready"];
    const i = order.indexOf(id);
    const c = order.indexOf(current);
    if (id === "ready") return current === "ready" ? "done" : "todo";
    if (i < c) return "done";
    if (i === c) return "current";
    return "todo";
  };

  const withSteps = (
    phase: InventoryGuidePhase,
    rest: Omit<InventoryGuide, "phase" | "steps">,
  ): InventoryGuide => ({
    phase,
    ...rest,
    steps: [
      {
        id: "catalogue",
        label: "Catalogue",
        status: stepStatus("catalogue", phase),
      },
      {
        id: "stock",
        label: "Stock",
        status: stepStatus("stock", phase),
      },
      {
        id: "sell",
        label: "First sale",
        status: stepStatus("sell", phase),
      },
    ],
  });

  if (products === 0) {
    return withSteps("catalogue", {
      title: "Start your catalogue",
      detail:
        categories === 0
          ? "Load a starter kit for a quick start, or create categories first then add your own products."
          : "You have categories. Load a starter kit or add products next.",
      primary: {
        href: "/inventory/starter-kits",
        label: "Load starter kit",
      },
      secondary: [
        { href: "/inventory/categories", label: "Categories first" },
        { href: "/inventory/products", label: "Add products" },
        { href: "/settings/go-live", label: "Go live in 1 day" },
      ],
    });
  }

  if (stockQty < 0.0001) {
    return withSteps("stock", {
      title: "Post opening stock",
      detail:
        "Products are on the list but quantity is still zero. Post opening stock (or receive against a PO) before selling.",
      primary: {
        href: "/inventory/stock/receive",
        label: "Opening / stock in",
      },
      secondary: [
        { href: "/inventory/stock", label: "View stock on hand" },
        { href: "/purchases/orders", label: "Purchase orders" },
        { href: "/settings/go-live", label: "Go live checklist" },
      ],
    });
  }

  if (sales === 0) {
    return withSteps("sell", {
      title: "You’re ready for the first sale",
      detail:
        "Catalogue and stock look set. Open POS and complete one sale to finish go-live.",
      primary: {
        href: "/sales/pos",
        label: "Open POS",
      },
      secondary: [
        { href: "/inventory/stock", label: "Check stock" },
        { href: "/settings/go-live", label: "Go live checklist" },
      ],
    });
  }

  return withSteps("ready", {
    title: "Inventory is operational",
    detail: "Keep products, stock levels, and movements up to date as you sell.",
    primary: {
      href: "/inventory/stock",
      label: "Stock on hand",
    },
    secondary: [
      { href: "/inventory/products", label: "Products" },
      { href: "/inventory/stock-movements", label: "Movements" },
    ],
  });
}
