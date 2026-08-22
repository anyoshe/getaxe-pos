import Link from "next/link";
import { redirect } from "next/navigation";

/**
 * Sales hub redirects to full-screen POS (supermarket-style).
 * Keep this route for nav compatibility.
 */
export default function SalesPage() {
  redirect("/sales/pos");
}
