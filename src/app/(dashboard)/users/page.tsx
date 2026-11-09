import { redirect } from "next/navigation";

/**
 * Canonical users UI lives under Settings.
 * Keep this route as a stable redirect for old bookmarks and role-home links.
 */
export default function UsersRedirectPage() {
  redirect("/settings/users");
}
