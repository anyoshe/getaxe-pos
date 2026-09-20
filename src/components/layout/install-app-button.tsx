"use client";

import { useCallback, useEffect, useState } from "react";
import { Download } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const STORAGE_KEY = "getaxe-pwa-installed";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

function isStandalone(): boolean {
  if (typeof window === "undefined") return false;
  const mq = window.matchMedia("(display-mode: standalone)").matches;
  const ios =
    "standalone" in window.navigator &&
    Boolean((window.navigator as Navigator & { standalone?: boolean }).standalone);
  return mq || ios;
}

/**
 * Shows “Install app” only when the browser can install (beforeinstallprompt)
 * and the app is not already running as an installed PWA.
 * Hides permanently after a successful install (localStorage + standalone).
 */
export function InstallAppButton({
  className,
  variant = "outline",
  size = "sm",
}: {
  className?: string;
  variant?: "outline" | "default" | "ghost" | "secondary";
  size?: "sm" | "default" | "lg" | "icon";
}) {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(
    null,
  );
  const [hidden, setHidden] = useState(true);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    if (isStandalone() || localStorage.getItem(STORAGE_KEY) === "1") {
      setHidden(true);
      setDeferred(null);
      return;
    }

    setHidden(false);

    const onBip = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
      setHidden(false);
    };

    const onInstalled = () => {
      localStorage.setItem(STORAGE_KEY, "1");
      setDeferred(null);
      setHidden(true);
    };

    window.addEventListener("beforeinstallprompt", onBip);
    window.addEventListener("appinstalled", onInstalled);

    // If already standalone after navigation
    if (isStandalone()) {
      localStorage.setItem(STORAGE_KEY, "1");
      setHidden(true);
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", onBip);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  const onInstall = useCallback(async () => {
    if (!deferred) return;
    setBusy(true);
    try {
      await deferred.prompt();
      const choice = await deferred.userChoice;
      if (choice.outcome === "accepted") {
        localStorage.setItem(STORAGE_KEY, "1");
        setHidden(true);
        setDeferred(null);
      }
      // If dismissed, keep button so they can try again later
    } catch {
      // ignore
    } finally {
      setBusy(false);
    }
  }, [deferred]);

  // Only show when install is available (Chrome/Edge/Android).
  // iOS has no beforeinstallprompt — hide to avoid a dead button.
  if (hidden || !deferred) return null;

  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      disabled={busy}
      onClick={onInstall}
      className={cn("gap-1.5 shrink-0", className)}
      title="Install GetAxe as an app on this device"
    >
      <Download className="h-4 w-4" />
      <span className="hidden sm:inline">
        {busy ? "Installing…" : "Install app"}
      </span>
      <span className="sm:hidden">{busy ? "…" : "Install"}</span>
    </Button>
  );
}
