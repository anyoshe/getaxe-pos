"use client";

import { CloudOff, RefreshCw, Wifi } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useOffline } from "@/providers/offline-provider";

export function ConnectionStatus() {
  const { online, pendingCount, flushOutbox } = useOffline();

  if (online && pendingCount === 0) {
    return (
      <span
        className="hidden items-center gap-1 rounded-full bg-chart-4/15 px-2 py-1 text-[10px] font-semibold text-chart-4 sm:inline-flex"
        title="Online"
      >
        <Wifi className="h-3 w-3" />
        Online
      </span>
    );
  }

  if (!online) {
    return (
      <span
        className="inline-flex items-center gap-1 rounded-full bg-chart-5/15 px-2 py-1 text-[10px] font-semibold text-chart-5"
        title="Offline — changes queue until connection returns"
      >
        <CloudOff className="h-3 w-3" />
        Offline
        {pendingCount > 0 ? ` · ${pendingCount}` : ""}
      </span>
    );
  }

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      className="h-8 gap-1 rounded-full px-2 text-[10px] font-semibold text-primary"
      onClick={() => void flushOutbox()}
      title="Sync pending offline sales"
    >
      <RefreshCw className="h-3 w-3" />
      Sync {pendingCount}
    </Button>
  );
}
