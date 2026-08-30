"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { platformLogin } from "../actions/platform-login";
import { ThemeToggle } from "@/components/layout/theme-toggle";

export function PlatformLoginForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const form = new FormData(e.currentTarget);
    const result = await platformLogin(
      String(form.get("email")),
      String(form.get("password")),
    );
    setLoading(false);
    if (!result.success) {
      setError(result.message);
      return;
    }
    router.push("/platform");
    router.refresh();
  }

  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <div className="brand-stripe h-1.5 w-full" />
      <div className="flex flex-1 items-center justify-center p-4">
        <div className="w-full max-w-md space-y-6 rounded-2xl border bg-card p-6 shadow-lg sm:p-8">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-sm font-black text-primary-foreground">
                GA
              </div>
              <h1 className="text-xl font-bold tracking-tight">
                Platform sign in
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                For GetAxe operators who invite and manage client businesses.
              </p>
            </div>
            <ThemeToggle />
          </div>

          <form onSubmit={submit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                required
                className="h-11 rounded-xl"
                autoComplete="username"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                required
                className="h-11 rounded-xl"
                autoComplete="current-password"
              />
            </div>
            {error ? (
              <p className="text-sm text-destructive">{error}</p>
            ) : null}
            <Button
              type="submit"
              className="h-11 w-full rounded-xl"
              disabled={loading}
            >
              {loading ? "Signing in…" : "Sign in"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
