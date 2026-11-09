"use server";

import { and, asc, desc, eq, ilike, or } from "drizzle-orm";

import { db } from "@/db";
import { products } from "@/db/schema/inventory/products";
import { customers } from "@/db/schema/sales/customers";
import { sales } from "@/db/schema/sales/sales";
import { requireCurrentUser } from "@/lib/auth/current-user";

export type GlobalSearchHit = {
  id: string;
  kind: "product" | "customer" | "sale" | "page";
  title: string;
  subtitle?: string;
  href: string;
};

const STATIC_PAGES: Array<{
  title: string;
  subtitle: string;
  href: string;
  keywords: string[];
}> = [
  {
    title: "Point of sale",
    subtitle: "Sell · scan · pay",
    href: "/sales/pos",
    keywords: ["pos", "sell", "cashier", "till", "counter"],
  },
  {
    title: "Dashboard",
    subtitle: "Owner command centre",
    href: "/dashboard",
    keywords: ["home", "dashboard", "overview"],
  },
  {
    title: "Products",
    subtitle: "Catalogue",
    href: "/inventory/products",
    keywords: ["products", "sku", "catalogue", "items"],
  },
  {
    title: "Stock on hand",
    subtitle: "Inventory balances",
    href: "/inventory/stock",
    keywords: ["stock", "inventory", "on hand", "qty"],
  },
  {
    title: "Receive stock",
    subtitle: "Opening / direct receive",
    href: "/inventory/stock/receive",
    keywords: ["receive", "opening stock", "grn"],
  },
  {
    title: "Purchase orders",
    subtitle: "Buying",
    href: "/purchases/orders",
    keywords: ["po", "purchase", "order", "supplier order"],
  },
  {
    title: "Goods receiving",
    subtitle: "GRN against PO",
    href: "/purchases/receiving",
    keywords: ["grn", "receiving", "goods"],
  },
  {
    title: "Customers",
    subtitle: "CRM",
    href: "/customers",
    keywords: ["customer", "client", "crm"],
  },
  {
    title: "Invoices",
    subtitle: "Sales documents",
    href: "/sales/invoices",
    keywords: ["invoice", "receipt", "sale"],
  },
  {
    title: "Receivables",
    subtitle: "Credit collections",
    href: "/sales/receivables",
    keywords: ["ar", "debt", "credit", "collect"],
  },
  {
    title: "Cash & bank",
    subtitle: "Tills",
    href: "/finance/cash-accounts",
    keywords: ["cash", "bank", "till", "mpesa drawer"],
  },
  {
    title: "eTIMS",
    subtitle: "Tax invoice path",
    href: "/settings/etims",
    keywords: ["etims", "kra", "tax", "invoice"],
  },
  {
    title: "M-Pesa",
    subtitle: "STK settings",
    href: "/settings/mpesa",
    keywords: ["mpesa", "stk", "till", "paybill"],
  },
  {
    title: "Go live in 1 day",
    subtitle: "Vertical, catalogue, stock, first sale",
    href: "/settings/go-live",
    keywords: ["setup", "go live", "wizard", "onboard", "readiness", "checklist"],
  },
  {
    title: "Reports",
    subtitle: "Sales · stock · finance",
    href: "/reports",
    keywords: ["report", "export", "pdf"],
  },
];

function customerDisplay(c: {
  customerType: string | null;
  companyName: string | null;
  tradingName: string | null;
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
}): string {
  if (c.customerType === "BUSINESS") {
    return (
      (c.companyName && c.companyName.trim()) ||
      (c.tradingName && c.tradingName.trim()) ||
      [c.firstName, c.lastName].filter(Boolean).join(" ") ||
      "Customer"
    );
  }
  return (
    [c.firstName, c.lastName].filter(Boolean).join(" ") ||
    (c.companyName && c.companyName.trim()) ||
    "Customer"
  );
}

export async function globalSearchAction(query: string): Promise<{
  success: true;
  hits: GlobalSearchHit[];
}> {
  const user = await requireCurrentUser();
  const q = (query ?? "").trim();
  const hits: GlobalSearchHit[] = [];

  if (q.length < 1) {
    return {
      success: true,
      hits: STATIC_PAGES.slice(0, 8).map((p) => ({
        id: p.href,
        kind: "page" as const,
        title: p.title,
        subtitle: p.subtitle,
        href: p.href,
      })),
    };
  }

  const qLower = q.toLowerCase();
  const pattern = `%${q.replace(/[%_]/g, "")}%`;

  for (const p of STATIC_PAGES) {
    if (
      p.title.toLowerCase().includes(qLower) ||
      p.subtitle.toLowerCase().includes(qLower) ||
      p.keywords.some((k) => k.includes(qLower) || qLower.includes(k))
    ) {
      hits.push({
        id: p.href,
        kind: "page",
        title: p.title,
        subtitle: p.subtitle,
        href: p.href,
      });
    }
  }

  const [productRows, customerRows, saleRows] = await Promise.all([
    db
      .select({
        id: products.id,
        name: products.name,
        sku: products.sku,
        barcode: products.barcode,
      })
      .from(products)
      .where(
        and(
          eq(products.businessId, user.businessId),
          or(
            ilike(products.name, pattern),
            ilike(products.sku, pattern),
            ilike(products.barcode, pattern),
          ),
        ),
      )
      .orderBy(asc(products.name))
      .limit(8)
      .catch(() => []),
    db
      .select({
        id: customers.id,
        customerType: customers.customerType,
        companyName: customers.companyName,
        tradingName: customers.tradingName,
        firstName: customers.firstName,
        lastName: customers.lastName,
        phone: customers.phone,
      })
      .from(customers)
      .where(
        and(
          eq(customers.businessId, user.businessId),
          or(
            ilike(customers.firstName, pattern),
            ilike(customers.lastName, pattern),
            ilike(customers.companyName, pattern),
            ilike(customers.tradingName, pattern),
            ilike(customers.phone, pattern),
            ilike(customers.customerNumber, pattern),
          ),
        ),
      )
      .limit(6)
      .catch(() => []),
    db
      .select({
        id: sales.id,
        invoiceNumber: sales.invoiceNumber,
        total: sales.total,
        status: sales.status,
      })
      .from(sales)
      .where(
        and(
          eq(sales.businessId, user.businessId),
          ilike(sales.invoiceNumber, pattern),
        ),
      )
      .orderBy(desc(sales.soldAt))
      .limit(6)
      .catch(() => []),
  ]);

  for (const p of productRows) {
    hits.push({
      id: p.id,
      kind: "product",
      title: p.name,
      subtitle: [p.sku, p.barcode].filter(Boolean).join(" · ") || "Product",
      href: `/inventory/products?q=${encodeURIComponent(p.sku || p.name)}`,
    });
  }
  for (const c of customerRows) {
    const title = customerDisplay(c);
    hits.push({
      id: c.id,
      kind: "customer",
      title,
      subtitle: c.phone || "Customer",
      href: `/customers?q=${encodeURIComponent(c.phone || title)}`,
    });
  }
  for (const s of saleRows) {
    hits.push({
      id: s.id,
      kind: "sale",
      title: s.invoiceNumber,
      subtitle: `${s.status} · KES ${Number(s.total ?? 0).toLocaleString()}`,
      href: `/sales/invoices/${s.id}`,
    });
  }

  return { success: true, hits: hits.slice(0, 24) };
}
