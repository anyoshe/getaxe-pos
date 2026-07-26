import type { NavigationSection } from "./navigation.types";
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
  GitBranch,
  Warehouse,
  Users,
  ShieldCheck,
  Building2,
  Hash,
  Ruler
} from "lucide-react";



export const navigation: NavigationSection[] = [

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
        icon: Settings,

        children: [

          {
            label: "Branches",
            href: "/settings/branches",
            icon: GitBranch,
          },

          {
            label: "Warehouses",
            href: "/settings/warehouses",
            icon: Warehouse,
          },

          {
  label: "Units",
  href: "/settings/units",
  icon: Ruler,
},

          {
            label: "Business Profile",
            href: "/settings/business",
            icon: Building2,
          },

          {
            label: "Users",
            href: "/settings/users",
            icon: Users,
          },

          {
            label: "Roles & Permissions",
            href: "/settings/roles",
            icon: ShieldCheck,
          },

          {
            label: "Numbering",
            href: "/settings/numbering",
            icon: Hash,
          },

        ],
      },

    ],
  },

];