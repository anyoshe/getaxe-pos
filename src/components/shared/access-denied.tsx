import Link from "next/link";
import { ShieldOff } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/** Full-page denial when a route cannot soft-redirect. */
export function AccessDenied({
  title = "You cannot open this page",
  description = "Your role does not include this area. Ask the business owner to update your permissions if you need it.",
}: {
  title?: string;
  description?: string;
}) {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center px-4 py-12 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500/15 text-amber-800 dark:text-amber-200">
        <ShieldOff className="h-7 w-7" aria-hidden />
      </div>
      <h1 className="text-xl font-semibold tracking-tight">{title}</h1>
      <p className="mt-2 max-w-md text-sm text-muted-foreground">{description}</p>
      <div className="mt-6 flex flex-wrap justify-center gap-2">
        <Link href="/dashboard" className={cn(buttonVariants())}>
          Back to home
        </Link>
        <Link
          href="/sales/pos"
          className={cn(buttonVariants({ variant: "outline" }))}
        >
          Open till
        </Link>
      </div>
    </div>
  );
}
