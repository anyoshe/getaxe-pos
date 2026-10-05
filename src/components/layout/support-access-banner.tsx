"use client";

import { useTransition } from "react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { exitSupportAccessAction } from "@/features/platform/actions/support-access";

export function SupportAccessBanner({
  businessName,
  platformEmail,
  actingAsEmail,
}: {
  businessName?: string | null;
  platformEmail?: string | null;
  actingAsEmail?: string | null;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <div className="border-b border-amber-500/40 bg-amber-500/15 px-3 py-2 text-sm text-amber-950 dark:bg-amber-500/20 dark:text-amber-50">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-2">
        <p className="min-w-0 flex-1">
          <span className="font-semibold">Support mode</span>
          {platformEmail ? (
            <>
              {" "}
              · platform: <span className="font-medium">{platformEmail}</span>
            </>
          ) : null}
          {businessName ? (
            <>
              {" "}
              · business: <span className="font-medium">{businessName}</span>
            </>
          ) : null}
          {actingAsEmail ? (
            <>
              {" "}
              · acting as: <span className="font-medium">{actingAsEmail}</span>
            </>
          ) : null}
          . Changes you make are real for this tenant.
        </p>
        <div className="flex shrink-0 flex-wrap gap-2">
          <Link
            href="/platform/businesses"
            className="inline-flex h-8 items-center rounded-md border border-input bg-background px-3 text-xs font-medium hover:bg-muted"
          >
            Platform list
          </Link>
          <Button
            type="button"
            size="sm"
            variant="default"
            disabled={pending}
            onClick={() => {
              startTransition(async () => {
                try {
                  await exitSupportAccessAction();
                } catch {
                  /* redirect */
                }
              });
            }}
          >
            {pending ? "Leaving…" : "Exit support"}
          </Button>
        </div>
      </div>
    </div>
  );
}
