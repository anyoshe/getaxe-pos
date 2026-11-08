/**
 * One-day go-live path by business vertical.
 * Links map to existing GetAxe screens; readinessIds align with setup-readiness checks.
 */

export type GoLiveVertical =
  | "pharmacy"
  | "hardware"
  | "agrovet"
  | "spares"
  | "general";

export type GoLiveTask = {
  id: string;
  title: string;
  detail: string;
  href: string;
  hrefLabel: string;
  /** Match SetupCheck.id when available */
  readinessId?: string;
  minutes: number;
};

export type GoLiveBlock = {
  id: string;
  when: string;
  title: string;
  tasks: GoLiveTask[];
};

export function resolveGoLiveVertical(
  businessType: string | null | undefined,
): GoLiveVertical {
  const t = (businessType ?? "OTHER").toUpperCase();
  if (
    ["PHARMACY", "CHEMIST", "CLINIC", "HOSPITAL", "LABORATORY", "OPTICAL"].includes(
      t,
    )
  ) {
    return "pharmacy";
  }
  if (
    [
      "HARDWARE",
      "ELECTRICAL",
      "ELECTRONICS",
      "PLUMBING",
      "BUILDING_MATERIALS",
      "PAINT",
    ].includes(t)
  ) {
    return "hardware";
  }
  if (["AGROVET", "FARM_SUPPLIES"].includes(t)) {
    return "agrovet";
  }
  if (["SPARE_PARTS", "GARAGE", "TYRE_CENTER", "AUTO"].includes(t)) {
    return "spares";
  }
  return "general";
}

export function verticalLabel(v: GoLiveVertical): string {
  switch (v) {
    case "pharmacy":
      return "Pharmacy / Chemist";
    case "hardware":
      return "Hardware";
    case "agrovet":
      return "Agrovet";
    case "spares":
      return "Spares / Garage";
    default:
      return "General retail";
  }
}

export function buildGoLiveDay(vertical: GoLiveVertical): GoLiveBlock[] {
  const foundation: GoLiveBlock = {
    id: "morning",
    when: "Morning · foundations",
    title: "Business, place, money drawers",
    tasks: [
      {
        id: "profile",
        title: "Confirm business profile & type",
        detail:
          "Legal name and business type must be correct — they drive menus and which starter kit appears.",
        href: "/settings/business",
        hrefLabel: "Business profile",
        readinessId: "profile",
        minutes: 10,
      },
      {
        id: "branch-wh",
        title: "Branch + main warehouse",
        detail: "One selling location and one stock location is enough for day one.",
        href: "/settings/branches",
        hrefLabel: "Branches",
        readinessId: "branch",
        minutes: 10,
      },
      {
        id: "tills",
        title: "Cash / M-Pesa / bank tills",
        detail:
          "Each channel should use its own ledger so end-of-day cash is truthful.",
        href: "/finance/cash-accounts",
        hrefLabel: "Cash & bank",
        readinessId: "cash",
        minutes: 15,
      },
      {
        id: "caps",
        title: "Turn on the right capabilities",
        detail:
          vertical === "pharmacy"
            ? "Enable pharmacy / medicine catalogue (and serials only if you track them)."
            : vertical === "spares"
              ? "Enable serial numbers for complete units; batch only if you need it."
              : "Enable multi-unit, batch/expiry only if your trade needs them.",
        href: "/settings/capabilities",
        hrefLabel: "Capabilities",
        readinessId: "caps",
        minutes: 10,
      },
    ],
  };

  let products: GoLiveBlock;
  if (vertical === "pharmacy") {
    products = {
      id: "midday",
      when: "Midday · catalogue",
      title: "Medicines without typing every line",
      tasks: [
        {
          id: "starters",
          title: "Load pharmacy starter medicines",
          detail:
            "Add selected masters from the starter list — then you only receive what is on the shelf.",
          href: "/inventory/starter-kits",
          hrefLabel: "Starter kits",
          readinessId: "product",
          minutes: 25,
        },
        {
          id: "prices",
          title: "Cost + sell (or category markup)",
          detail:
            "Set retail from product sell price or apply category markup, then check Product prices.",
          href: "/inventory/product-prices",
          hrefLabel: "Product prices",
          minutes: 20,
        },
        {
          id: "opening",
          title: "Opening stock (Excel or receive)",
          detail:
            "Import opening stock or receive against MAIN warehouse with batch/expiry where required.",
          href: "/inventory/stock/receive",
          hrefLabel: "Receive / opening stock",
          readinessId: "stock",
          minutes: 40,
        },
      ],
    };
  } else if (vertical === "hardware") {
    products = {
      id: "midday",
      when: "Midday · catalogue",
      title: "Hardware kit + prices",
      tasks: [
        {
          id: "starters",
          title: "Load hardware starter kit",
          detail: "Select common materials and tools → Add selected → import any extras.",
          href: "/inventory/starter-kits",
          hrefLabel: "Starter kits",
          readinessId: "product",
          minutes: 25,
        },
        {
          id: "prices",
          title: "Category markups or product sell prices",
          detail: "Hardware often prices as cost × markup by category.",
          href: "/inventory/categories",
          hrefLabel: "Categories",
          minutes: 20,
        },
        {
          id: "opening",
          title: "Opening stock",
          detail: "Receive quantities into MAIN (decimal OK for kg/L).",
          href: "/inventory/stock/receive",
          hrefLabel: "Receive stock",
          readinessId: "stock",
          minutes: 40,
        },
      ],
    };
  } else if (vertical === "agrovet") {
    products = {
      id: "midday",
      when: "Midday · catalogue",
      title: "Agrovet kit + stock",
      tasks: [
        {
          id: "starters",
          title: "Load agrovet starter kit",
          detail: "Feeds, fertiliser, animal health — add selected, then local brands via Excel.",
          href: "/inventory/starter-kits",
          hrefLabel: "Starter kits",
          readinessId: "product",
          minutes: 25,
        },
        {
          id: "opening",
          title: "Opening stock",
          detail: "Receive what is physically on hand; use kg/L decimals where needed.",
          href: "/inventory/stock/receive",
          hrefLabel: "Receive stock",
          readinessId: "stock",
          minutes: 40,
        },
      ],
    };
  } else if (vertical === "spares") {
    products = {
      id: "midday",
      when: "Midday · catalogue",
      title: "Parts + serialized units",
      tasks: [
        {
          id: "starters",
          title: "Motorbike / auto starter kits",
          detail:
            "Parts and complete units. Serials for units are captured when you receive stock.",
          href: "/inventory/starter-kits",
          hrefLabel: "Starter kits",
          readinessId: "product",
          minutes: 30,
        },
        {
          id: "opening",
          title: "Opening stock + serials",
          detail: "Receive parts by qty; for units enter chassis/engine serials as required.",
          href: "/inventory/stock/receive",
          hrefLabel: "Receive stock",
          readinessId: "stock",
          minutes: 45,
        },
      ],
    };
  } else {
    products = {
      id: "midday",
      when: "Midday · catalogue",
      title: "Products & stock",
      tasks: [
        {
          id: "products",
          title: "Products (starter kit or Excel)",
          detail: "Use a starter kit if offered, or import Excel, or add a few fast movers manually.",
          href: "/inventory/products",
          hrefLabel: "Products",
          readinessId: "product",
          minutes: 40,
        },
        {
          id: "opening",
          title: "Opening stock",
          detail: "Put quantity on the shelf into the system before the first sale.",
          href: "/inventory/stock/receive",
          hrefLabel: "Receive stock",
          readinessId: "stock",
          minutes: 30,
        },
      ],
    };
  }

  const afternoon: GoLiveBlock = {
    id: "afternoon",
    when: "Afternoon · sell",
    title: "First live sale",
    tasks: [
      {
        id: "pos",
        title: "Open POS and complete one sale",
        detail:
          "Cash or M-Pesa test sale proves stock, price, and till wiring. Prefer a real small sale.",
        href: "/sales/pos",
        hrefLabel: "Open POS",
        readinessId: "sale",
        minutes: 15,
      },
      {
        id: "print",
        title: "Print / view receipt",
        detail: "Confirm business name and totals print correctly for the customer.",
        href: "/sales/invoices",
        hrefLabel: "Invoices",
        minutes: 5,
      },
      {
        id: "recon",
        title: "Optional: end-of-day glance",
        detail: "Cash & bank balances should move with the sale; fix till mapping if not.",
        href: "/finance/cash-accounts",
        hrefLabel: "Cash & bank",
        minutes: 10,
      },
    ],
  };

  return [foundation, products, afternoon];
}
