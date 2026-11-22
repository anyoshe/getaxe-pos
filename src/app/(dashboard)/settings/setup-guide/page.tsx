import { requirePageAccess } from "@/lib/auth/authorize";
import { redirect } from "next/navigation";

/**
 * Phase C: long setup wizard archived.
 * Canonical path is /settings/go-live (vertical pack + import + checklist).
 * Optional ?docs=1 reserved for a future static guide without competing with go-live.
 */
export default async function SetupGuideArchivePage() {
  await requirePageAccess("business.view");

  redirect("/settings/go-live");
}
