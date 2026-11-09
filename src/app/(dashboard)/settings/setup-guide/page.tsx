import { redirect } from "next/navigation";

/**
 * Phase C: long setup wizard archived.
 * Canonical path is /settings/go-live (vertical pack + import + checklist).
 * Optional ?docs=1 reserved for a future static guide without competing with go-live.
 */
export default function SetupGuideArchivePage() {
  redirect("/settings/go-live");
}
