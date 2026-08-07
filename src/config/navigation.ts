// import type { NavigationItem } from "./navigation.types";

// import {
//   LayoutDashboard,
//   Package,
//   Boxes,
//   BriefcaseBusiness,
//   SlidersHorizontal,
//   Truck,
//   ShoppingCart,
//   Receipt,
//   Pill,
//   Stethoscope,
//   Shield,
//   Wallet,
//   BarChart3,
//   Settings,
//   GitBranch,
//   Warehouse,
//   Users,
//   ShieldCheck,
//   Building2,
//   Hash,
//   Ruler,
//   ClipboardList,
// } from "lucide-react";


// export const navigation: NavigationItem[] = [

//   {
//     label: "Dashboard",
//     href: "/dashboard",
//     icon: LayoutDashboard,
//   },


//   {
//     label: "Sales",
//     href: "/sales",
//     icon: ShoppingCart,
//   },


//   {
//     label: "Inventory",
//     href: "/inventory",
//     icon: Package,

//     children: [
//       {
//         label: "Products",
//         href: "/inventory/products",
//         icon: Package,
//       },

//       {
//         label: "Stock",
//         href: "/inventory/stock",
//         icon: Boxes,
//       },

//       {
//         label: "Suppliers",
//         href: "/suppliers",
//         icon: Truck,
//       },
//     ],
//   },


//   {
//     label: "Purchasing",
//     href: "/purchases",
//     icon: ClipboardList,
//   },


//   {
//     label: "Customers",
//     href: "/customers",
//     icon: Receipt,
//   },


//   {
//     label: "Finance",
//     href: "/finance",
//     icon: Wallet,
//   },


//   {
//     label: "Reports",
//     href: "/reports",
//     icon: BarChart3,
//   },


//  {
//   label: "Industry Modules",
//   icon: BriefcaseBusiness,

//     children: [
//       {
//         label: "Pharmacy",
//         href: "/pharmacy",
//         icon: Pill,
//       },

//       {
//         label: "Clinical",
//         href: "/clinical",
//         icon: Stethoscope,
//       },

//       {
//         label: "Insurance",
//         href: "/insurance",
//         icon: Shield,
//       },
//     ],
//   },


//  {
//   label: "Operations",
//   icon: Boxes,

//     children: [
//       {
//         label: "Branches",
//         href: "/settings/branches",
//         icon: GitBranch,
//       },

//       {
//         label: "Warehouses",
//         href: "/settings/warehouses",
//         icon: Warehouse,
//       },

//       {
//         label: "Users",
//         href: "/settings/users",
//         icon: Users,
//       },
//     ],
//   },


//  {
//   label: "Settings",
//   icon: SlidersHorizontal,

//     children: [
//       {
//         label: "Business Profile",
//         href: "/settings/business",
//         icon: Building2,
//       },

//       {
//         label: "Roles & Permissions",
//         href: "/settings/roles",
//         icon: ShieldCheck,
//       },

//       {
//         label: "Units",
//         href: "/settings/units",
//         icon: Ruler,
//       },

//       {
//         label: "Numbering",
//         href: "/settings/numbering",
//         icon: Hash,
//       },
//     ],
//   },

// ];

import type { NavigationItem } from "./navigation.types";

import {
  LayoutDashboard,
  Package,
  Boxes,
  Truck,
  ShoppingCart,
  Receipt,
  Wallet,
  BarChart3,
  Settings,
  GitBranch,
  Warehouse,
  Users,
  ShieldCheck,
  Building2,
  Hash,
  Ruler,
  ClipboardList,
  FolderTree,
  ArrowRightLeft,
  PackageCheck,
  FileText,
  ReceiptText,
  RotateCcw,
  CreditCard,
  Banknote,
  CircleDollarSign,
  UsersRound,
  Wrench,
} from "lucide-react";

export const navigation: NavigationItem[] = [

  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },

  {
    label: "Sales",
    icon: ShoppingCart,

    children: [
      {
        label: "POS",
        href: "/sales",
        icon: ShoppingCart,
      },
      {
        label: "Quotations",
        href: "/sales/quotations",
        icon: FileText,
      },
      {
        label: "Sales Orders",
        href: "/sales/orders",
        icon: ReceiptText,
      },
      {
        label: "Invoices",
        href: "/sales/invoices",
        icon: Receipt,
      },
      {
        label: "Returns",
        href: "/sales/returns",
        icon: RotateCcw,
      },
    ],
  },

  {
    label: "Inventory",
    icon: Package,

    children: [
      {
        label: "Products",
        href: "/inventory/products",
        icon: Package,
      },
      {
        label: "Categories",
        href: "/inventory/categories",
        icon: FolderTree,
      },
      {
        label: "Stock",
        href: "/inventory/stock",
        icon: Boxes,
      },
      {
        label: "Adjustments",
        href: "/inventory/adjustments",
        icon: PackageCheck,
      },
      {
        label: "Transfers",
        href: "/inventory/transfers",
        icon: ArrowRightLeft,
      },
    ],
  },

  {
    label: "Purchasing",
    icon: ClipboardList,

    children: [
      {
        label: "Suppliers",
        href: "/suppliers",
        icon: Truck,
      },
      {
        label: "Purchase Orders",
        href: "/purchases/orders",
        icon: ClipboardList,
      },
      {
        label: "Goods Received",
        href: "/purchases/receiving",
        icon: PackageCheck,
      },
    ],
  },

  {
    label: "CRM",
    icon: UsersRound,

    children: [
      {
        label: "Customers",
        href: "/customers",
        icon: UsersRound,
      },
    ],
  },

  {
    label: "Finance",
    icon: Wallet,

    children: [
      {
        label: "Payments",
        href: "/finance/payments",
        icon: CreditCard,
      },
      {
        label: "Expenses",
        href: "/finance/expenses",
        icon: Banknote,
      },
      {
        label: "Accounts",
        href: "/finance/accounts",
        icon: CircleDollarSign,
      },
    ],
  },

  {
    label: "Reports",
    icon: BarChart3,

    children: [
      {
        label: "Sales Reports",
        href: "/reports/sales",
        icon: BarChart3,
      },
      {
        label: "Inventory Reports",
        href: "/reports/inventory",
        icon: Package,
      },
      {
        label: "Financial Reports",
        href: "/reports/finance",
        icon: Wallet,
      },
    ],
  },

  {
    label: "Industry",
    icon: Wrench,

    children: [],
  },

  {
    label: "Operations",
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
        label: "Users",
        href: "/settings/users",
        icon: Users,
      },
    ],
  },

  {
    label: "Settings",
    icon: Settings,

    children: [
      {
        label: "Business Profile",
        href: "/settings/business",
        icon: Building2,
      },
      {
        label: "Roles & Permissions",
        href: "/settings/roles",
        icon: ShieldCheck,
      },
      {
        label: "Units",
        href: "/settings/units",
        icon: Ruler,
      },
      {
        label: "Numbering",
        href: "/settings/numbering",
        icon: Hash,
      },
    ],
  },

];