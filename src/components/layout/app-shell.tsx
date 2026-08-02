// import type { ReactNode } from "react";

// import { Sidebar } from "./sidebar";
// import { Topbar } from "./topbar";

// interface AppShellProps {
//   children: ReactNode;
//   user: any;
// }

// export function AppShell({
//   children,
//   user,
// }: AppShellProps) {
//   return (
//     <div className="min-h-screen bg-slate-50">
//       <Sidebar />

//       <div className="lg:pl-72">
//         <Topbar user={user} />

//         <main className="px-4 py-6 sm:px-6 lg:px-8">
//           <div className="mx-auto max-w-7xl">
//             {children}
//           </div>
//         </main>
//       </div>
//     </div>
//   );
// }

import type { ReactNode } from "react";

import { Sidebar } from "./sidebar";
import { Topbar } from "./topbar";

import type {
  CurrentUser,
} from "@/lib/auth/current-user";

interface AppShellProps {
  children: ReactNode;
  user: CurrentUser;
}

export function AppShell({
  children,
  user,
}: AppShellProps) {
  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar />

      <div className="lg:pl-72">
        <Topbar user={user} />

        <main className="px-4 py-6 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}