import { requirePageAccess } from "@/lib/auth/authorize";
import Link from "next/link";
import { redirect } from "next/navigation";

/**
 * Sales hub redirects to full-screen POS (supermarket-style).
 * Keep this route for nav compatibility.
 */
export default async function SalesPage() {
  await requirePageAccess("sales.view");

  redirect("/sales/pos");
}
