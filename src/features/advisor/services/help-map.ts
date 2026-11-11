/**
 * Phase E — in-app “how do I…?” answers grounded in real GetAxe routes.
 * Keep paths in sync with src/config/navigation.ts (no invented screens).
 */

export type HelpStep = {
  title: string;
  detail?: string;
  href?: string;
  hrefLabel?: string;
};

export type HelpTopic = {
  id: string;
  /** Matched against owner question (any term) */
  terms: string[];
  title: string;
  summary: string;
  steps: HelpStep[];
};

/** Canonical help topics — only real app routes. */
export const HELP_TOPICS: HelpTopic[] = [
  {
    id: "go-live",
    terms: [
      "go live",
      "golive",
      "getting started",
      "first day",
      "onboard",
      "set up business",
      "setup business",
    ],
    title: "Go live in one day",
    summary:
      "Use the single go-live path so type, capabilities, catalogue, and first sale stay in order.",
    steps: [
      {
        title: "Open Go live in 1 day",
        href: "/settings/go-live",
        hrefLabel: "Go live",
      },
      {
        title: "Apply your vertical pack",
        detail: "Pharmacy, hardware, agrovet, spares, or general retail.",
        href: "/settings/go-live",
      },
      {
        title: "Add or confirm products",
        href: "/inventory/products",
        hrefLabel: "Products",
      },
      {
        title: "Post opening stock",
        href: "/inventory/stock/receive",
        hrefLabel: "Receive stock",
      },
      {
        title: "Make the first sale on POS",
        href: "/sales/pos",
        hrefLabel: "POS",
      },
    ],
  },
  {
    id: "add-product",
    terms: [
      "add product",
      "create product",
      "new product",
      "how do i add a product",
      "product creation",
    ],
    title: "Add a product",
    summary:
      "Categories first, then products. Quick-add is default; full form for medicine/batches.",
    steps: [
      {
        title: "Create a category if you have none",
        href: "/inventory/categories",
        hrefLabel: "Categories",
      },
      {
        title: "Add the product",
        detail: "Use quick-add for speed, or full form when you need packs/batches.",
        href: "/inventory/products",
        hrefLabel: "Products",
      },
      {
        title: "Optional: set prices on the price list",
        href: "/inventory/product-prices",
        hrefLabel: "Product prices",
      },
      {
        title: "Or paste a whole list in this chat",
        detail: 'Say "paste products:" then one product per line.',
      },
    ],
  },
  {
    id: "opening-stock",
    terms: [
      "opening stock",
      "start stock",
      "initial stock",
      "load stock",
      "receive stock",
      "how do i add stock",
    ],
    title: "Post opening / receive stock",
    summary: "Stock only increases when you receive or open inventory — not when you create a product.",
    steps: [
      {
        title: "Receive stock into a warehouse",
        href: "/inventory/stock/receive",
        hrefLabel: "Receive stock",
      },
      {
        title: "Or use stock adjustments for corrections",
        href: "/inventory/adjustments",
        hrefLabel: "Adjustments",
      },
      {
        title: "Check on-hand balances",
        href: "/inventory/stock",
        hrefLabel: "Stock on hand",
      },
    ],
  },
  {
    id: "pos-sale",
    terms: [
      "make a sale",
      "first sale",
      "how do i sell",
      "use pos",
      "point of sale",
      "cashier",
    ],
    title: "Sell on POS",
    summary: "Full-screen till: search/scan, cart, then pay (cash / M-Pesa / card / bank).",
    steps: [
      {
        title: "Open POS",
        href: "/sales/pos",
        hrefLabel: "POS",
      },
      {
        title: "Search or scan products into the cart",
        detail: "Pick batch/expiry when the product tracks batches.",
      },
      {
        title: "Choose payment and complete the sale",
        detail: "Customer is optional except for credit invoices.",
      },
    ],
  },
  {
    id: "purchase-order",
    terms: [
      "purchase order",
      "create po",
      "how do i order",
      "buy stock",
      "supplier order",
    ],
    title: "Raise a purchase order",
    summary: "Draft PO → approve → receive goods. Advisor can draft from restock.",
    steps: [
      {
        title: "Check what is low",
        href: "/dashboard/attention?kind=restock",
        hrefLabel: "Restock list",
      },
      {
        title: "Create a purchase order",
        href: "/purchases/orders",
        hrefLabel: "Purchase orders",
      },
      {
        title: "Receive goods when delivery arrives",
        href: "/purchases/receiving",
        hrefLabel: "Receiving",
      },
      {
        title: "Or ask in this chat",
        detail: 'Say "draft PO from restock" then confirm create.',
      },
    ],
  },
  {
    id: "mpesa",
    terms: ["mpesa", "m-pesa", "stk", "mobile money", "lipa"],
    title: "Take M-Pesa on POS",
    summary: "Configure till accounts, then use Mobile money / M-Pesa on the till.",
    steps: [
      {
        title: "Set cash / M-Pesa tills and ledgers",
        href: "/finance/cash-accounts",
        hrefLabel: "Cash accounts",
      },
      {
        title: "Sell on POS and choose M-Pesa",
        href: "/sales/pos",
        hrefLabel: "POS",
      },
      {
        title: "Enter phone / STK or confirmation code",
        detail: "Complete sale only when payment status is clear.",
      },
    ],
  },
  {
    id: "customers-credit",
    terms: [
      "customer credit",
      "credit sale",
      "receivable",
      "who owes",
      "add customer",
    ],
    title: "Customers and credit sales",
    summary: "Register customers, enable credit where allowed, collect under receivables.",
    steps: [
      {
        title: "Add or open customers",
        href: "/customers",
        hrefLabel: "Customers",
      },
      {
        title: "Sell on credit from POS (credit invoice)",
        href: "/sales/pos",
        hrefLabel: "POS",
      },
      {
        title: "Collect outstanding balances",
        href: "/sales/receivables",
        hrefLabel: "Receivables",
      },
    ],
  },
  {
    id: "prices",
    terms: [
      "set price",
      "change price",
      "selling price",
      "price list",
      "markup",
    ],
    title: "Set selling prices",
    summary: "Product prices and price lists drive POS; category markup can bulk-apply.",
    steps: [
      {
        title: "Edit product prices",
        href: "/inventory/product-prices",
        hrefLabel: "Product prices",
      },
      {
        title: "Manage price lists",
        href: "/inventory/price-lists",
        hrefLabel: "Price lists",
      },
      {
        title: "Optional: category markup",
        href: "/inventory/categories",
        hrefLabel: "Categories",
      },
    ],
  },
  {
    id: "users-roles",
    terms: ["add user", "invite user", "roles", "permissions", "cashier login"],
    title: "Users and roles",
    summary: "Invite staff and control what they can open via roles.",
    steps: [
      {
        title: "Users",
        href: "/users",
        hrefLabel: "Users",
      },
      {
        title: "Roles & permissions",
        href: "/settings/roles",
        hrefLabel: "Roles",
      },
    ],
  },
  {
    id: "reports",
    terms: ["report", "reports", "how do i see sales", "profit report"],
    title: "Reports and owner view",
    summary: "Start on the dashboard; use profit and attention for detail.",
    steps: [
      {
        title: "Dashboard",
        href: "/dashboard",
        hrefLabel: "Dashboard",
      },
      {
        title: "Gross profit",
        href: "/dashboard/profit",
        hrefLabel: "Profit",
      },
      {
        title: "Attention / restock",
        href: "/dashboard/attention?kind=restock",
        hrefLabel: "Attention",
      },
      {
        title: "Ask for a daily brief in this chat",
        detail: 'Say "daily brief".',
      },
    ],
  },
  {
    id: "transfers",
    terms: ["transfer stock", "branch transfer", "move stock"],
    title: "Transfer stock between locations",
    summary: "Use inventory transfers when stock moves warehouse to warehouse.",
    steps: [
      {
        title: "Stock transfers",
        href: "/inventory/transfers",
        hrefLabel: "Transfers",
      },
      {
        title: "Confirm warehouses exist",
        href: "/settings/warehouses",
        hrefLabel: "Warehouses",
      },
    ],
  },
  {
    id: "returns",
    terms: ["sale return", "customer return", "refund"],
    title: "Customer returns",
    summary: "Process returns under Sales so stock and receivables stay consistent.",
    steps: [
      {
        title: "Sales returns",
        href: "/sales/returns",
        hrefLabel: "Returns",
      },
    ],
  },
];

export function parseHelpIntent(question: string): boolean {
  const q = question.toLowerCase().trim();
  if (
    /^(how\s+do\s+i|how\s+to|where\s+(do\s+i|can\s+i)|help\s+me|show\s+me\s+how)/.test(
      q,
    )
  ) {
    return true;
  }
  if (/^(help|what\s+can\s+you\s+do|commands)\b/.test(q)) return true;
  // Soft match: question contains a known task phrase
  return HELP_TOPICS.some((t) => t.terms.some((term) => q.includes(term)));
}

export function matchHelpTopic(question: string): HelpTopic | null {
  const q = question.toLowerCase().trim();

  let best: { topic: HelpTopic; score: number } | null = null;
  for (const topic of HELP_TOPICS) {
    let score = 0;
    for (const term of topic.terms) {
      if (q.includes(term)) score += term.length;
    }
    if (score > 0 && (!best || score > best.score)) {
      best = { topic, score };
    }
  }
  return best?.topic ?? null;
}

export function formatHelpAnswer(topic: HelpTopic | null, question: string): string {
  if (!topic) {
    const catalog = HELP_TOPICS.map((t) => `- **${t.title}**`).join("\n");
    return (
      "**I can walk you through GetAxe screens** (real links only).\n\n" +
      "Try asking e.g. *how do I add a product*, *how do I go live*, *how do I make a sale*, *how do I raise a PO*.\n\n" +
      "Topics I know:\n" +
      catalog
    );
  }

  const lines: string[] = [
    `**${topic.title}**`,
    "",
    topic.summary,
    "",
    "**Steps:**",
  ];
  topic.steps.forEach((s, i) => {
    lines.push(`${i + 1}. **${s.title}**` + (s.detail ? ` — ${s.detail}` : ""));
  });
  lines.push("");
  lines.push(`_Asked about: “${question.trim().slice(0, 120)}”_`);
  return lines.join("\n");
}

export function helpActions(topic: HelpTopic | null): {
  label: string;
  href: string;
}[] {
  if (!topic) {
    return [
      { label: "Go live", href: "/settings/go-live" },
      { label: "Dashboard", href: "/dashboard" },
      { label: "Products", href: "/inventory/products" },
      { label: "POS", href: "/sales/pos" },
    ];
  }
  const actions: { label: string; href: string }[] = [];
  for (const s of topic.steps) {
    if (s.href && !actions.some((a) => a.href === s.href)) {
      actions.push({
        label: s.hrefLabel ?? s.title,
        href: s.href,
      });
    }
  }
  return actions.slice(0, 6);
}
