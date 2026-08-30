"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";

export function ThemeToggle({
  className,
  variant = "ghost",
}: {
  className?: string;
  variant?: "ghost" | "outline" | "secondary";
}) {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <Button
        type="button"
        size="icon"
        variant={variant}
        className={className ?? "rounded-xl"}
        aria-label="Toggle theme"
      >
        <Sun className="h-5 w-5" />
      </Button>
    );
  }

  const dark = resolvedTheme === "dark";

  return (
    <Button
      type="button"
      size="icon"
      variant={variant}
      className={className ?? "rounded-xl"}
      aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
      onClick={() => setTheme(dark ? "light" : "dark")}
      title={dark ? "Light mode" : "Dark mode"}
    >
      {dark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
    </Button>
  );
}
