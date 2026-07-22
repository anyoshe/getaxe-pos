// export function LoginSidePanel() {
//   return (
//     <div className="hidden lg:flex flex-col justify-between bg-gradient-to-br from-indigo-700 via-violet-600 to-cyan-500 p-14 text-white">
//       <div>
//         <span className="rounded-full bg-white/20 px-4 py-2 text-sm backdrop-blur">
//           GETAXE POS
//         </span>

//         <h1 className="mt-8 text-5xl font-bold leading-tight">
//           Beautiful.
//           <br />
//           Fast.
//           <br />
//           Reliable.
//         </h1>

//         <p className="mt-6 max-w-md text-lg text-indigo-100">
//           A complete retail and healthcare management platform
//           built for pharmacies, hospitals, supermarkets,
//           wholesalers and growing businesses.
//         </p>
//       </div>

//       <div className="grid grid-cols-2 gap-4 text-sm">
//         <div>✓ Inventory</div>
//         <div>✓ Sales</div>
//         <div>✓ Purchasing</div>
//         <div>✓ Finance</div>
//         <div>✓ Pharmacy</div>
//         <div>✓ Clinical</div>
//         <div>✓ Insurance</div>
//         <div>✓ Reports</div>
//       </div>
//     </div>
//   );
// }

import {
  ShieldCheck,
  Package,
  ShoppingCart,
  BarChart3,
  Hospital,
  Cpu,
} from "lucide-react";

const features = [
  { icon: ShoppingCart, label: "Sales" },
  { icon: Package, label: "Inventory" },
  { icon: Hospital, label: "Clinical" },
  { icon: BarChart3, label: "Reports" },
  { icon: ShieldCheck, label: "Secure" },
  { icon: Cpu, label: "AI Ready" },
];

export function LoginSidePanel() {
  return (
    <div className="flex h-full flex-col justify-center">

      <h1 className="text-6xl font-black text-white">
        GetAxe POS
      </h1>

      <p className="mt-6 max-w-xl text-xl leading-8 text-white/75">
        A modern business platform built to manage retail,
        pharmacy, healthcare and finance in one place.
      </p>

      <div className="mt-12 flex flex-wrap gap-4">

        {features.map(({ icon: Icon, label }) => (
          <div
            key={label}
            className="
              flex items-center gap-2
              rounded-full
              border
              border-white/20
              bg-white/10
              px-5
              py-3
              backdrop-blur-xl
            "
          >
            <Icon className="h-5 w-5 text-cyan-300" />
            <span className="text-white">{label}</span>
          </div>
        ))}

      </div>

    </div>
  );
}