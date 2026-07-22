import {
  LayoutDashboard,
  Package,
  Boxes,
  Truck,
  ShoppingCart,
  Receipt,
  Pill,
  Stethoscope,
  Shield,
  Wallet,
  BarChart3,
  Settings,
} from "lucide-react";

export const navigation = [
  {
    title: "Main",
    items: [
      {
        label: "Dashboard",
        href: "/dashboard",
        icon: LayoutDashboard,
      },
    ],
  },

  {
    title: "Sales",
    items: [
      {
        label: "Sales",
        href: "/sales",
        icon: ShoppingCart,
      },
      {
        label: "Customers",
        href: "/customers",
        icon: Receipt,
      },
    ],
  },

  {
    title: "Inventory",
    items: [
      {
        label: "Products",
        href: "/inventory/products",
        icon: Package,
      },
      {
        label: "Stock",
        href: "/inventory/stock",
        icon: Boxes,
      },
      {
        label: "Suppliers",
        href: "/inventory/suppliers",
        icon: Truck,
      },
    ],
  },

  {
    title: "Pharmacy",
    items: [
      {
        label: "Dispensing",
        href: "/pharmacy",
        icon: Pill,
      },
    ],
  },

  {
    title: "Clinical",
    items: [
      {
        label: "Consultations",
        href: "/clinical",
        icon: Stethoscope,
      },
    ],
  },

  {
    title: "Insurance",
    items: [
      {
        label: "Claims",
        href: "/insurance",
        icon: Shield,
      },
    ],
  },

  {
    title: "Finance",
    items: [
      {
        label: "Finance",
        href: "/finance",
        icon: Wallet,
      },
    ],
  },

  {
    title: "Reports",
    items: [
      {
        label: "Reports",
        href: "/reports",
        icon: BarChart3,
      },
    ],
  },

  {
    title: "Settings",
    items: [
      {
        label: "Settings",
        href: "/settings",
        icon: Settings,
      },
    ],
  },
];