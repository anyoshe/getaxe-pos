"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ShieldOff } from "lucide-react";

import { Button } from "@/components/ui/button";

/**
 * Soft access denial after requirePageAccess redirect (?error=forbidden).
 * Shown once, then strips the query so refresh does not keep the banner.
 */
export function ForbiddenBanner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (searchParams.get("error") === "forbidden") {
      setVisible(true);
      const next = new URLSearchParams(searchParams.toString());
      next.delete("error");
      const q = next.toString();
      router.replace(q ? `${pathname}?${q}` : pathname, { scroll: false });
    }
  }, [searchParams, router, pathname]);

  if (!visible) return null;

  return (
    <div
      role="alert"
      className="mx-auto mb-4 w-full max-w-7xl rounded-xl border border-amber-500/40 bg-amber-500/10 px-4 py-3 sm:px-5"
    >
      <div className="flex flex-wrap items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/20 text-amber-900 dark:text-amber-200">
          <ShieldOff className="h-5 w-5" aria-hidden />
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-foreground">You cannot open that page</p>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Your role does not include this area. Ask the business owner or admin
            to update your permissions if you need access.
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="shrink-0 rounded-lg"
          onClick={() => setVisible(false)}
        >
          Dismiss
        </Button>
      </div>
    </div>
  );
}
