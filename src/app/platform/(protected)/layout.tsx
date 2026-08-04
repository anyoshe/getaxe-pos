import { redirect } from "next/navigation";

import {
  requirePlatformSession,
} from "@/lib/platform-auth/session";

export default async function PlatformLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  try {
    await requirePlatformSession();
  } catch {
    redirect("/platform/login");
  }

  return children;
}