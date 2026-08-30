"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Copy, Check } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { createBusinessOwnerAction } from "../../actions";

interface BusinessOwnerFormProps {
  onSuccess?: () => void;
}

export function BusinessOwnerForm({ onSuccess }: BusinessOwnerFormProps) {
  const [loading, setLoading] = useState(false);
  const [credentials, setCredentials] = useState<{
    email: string;
    password: string;
    name: string;
  } | null>(null);
  const [copied, setCopied] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    setLoading(true);
    const result = await createBusinessOwnerAction(formData);
    setLoading(false);

    if (!result.success) {
      toast.error("message" in result ? result.message : "Failed to create owner");
      return;
    }

    setCredentials({
      email: result.email,
      password: result.temporaryPassword,
      name: result.name,
    });
    toast.success("Business owner invited — share the credentials below");
    onSuccess?.();
  }

  async function copyAll() {
    if (!credentials) return;
    const text = `GetAxe POS login\nEmail: ${credentials.email}\nTemporary password: ${credentials.password}\nLogin: ${typeof window !== "undefined" ? window.location.origin : ""}/login\nAfter login you will set up your business.`;
    await navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Credentials copied");
    setTimeout(() => setCopied(false), 2000);
  }

  if (credentials) {
    return (
      <div className="space-y-4">
        <div className="rounded-xl border border-chart-4/30 bg-chart-4/10 p-4">
          <p className="text-sm font-semibold text-chart-4">
            First-time login credentials
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Share these once with {credentials.name}. They sign in at the main
            app, then complete business setup.
          </p>
          <dl className="mt-3 space-y-2 text-sm">
            <div className="flex justify-between gap-2">
              <dt className="text-muted-foreground">Email</dt>
              <dd className="font-mono font-medium">{credentials.email}</dd>
            </div>
            <div className="flex justify-between gap-2">
              <dt className="text-muted-foreground">Temp password</dt>
              <dd className="font-mono font-medium">{credentials.password}</dd>
            </div>
          </dl>
        </div>
        <Button type="button" className="w-full rounded-xl" onClick={() => void copyAll()}>
          {copied ? (
            <>
              <Check className="mr-2 h-4 w-4" /> Copied
            </>
          ) : (
            <>
              <Copy className="mr-2 h-4 w-4" /> Copy credentials
            </>
          )}
        </Button>
        <Button
          type="button"
          variant="outline"
          className="w-full rounded-xl"
          onClick={() => setCredentials(null)}
        >
          Invite another owner
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Full name</Label>
        <Input id="name" name="name" placeholder="Jane Wanjiku" required className="h-10 rounded-xl" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">Email (login)</Label>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="owner@business.co.ke"
          required
          className="h-10 rounded-xl"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="phone">Phone (optional)</Label>
        <Input id="phone" name="phone" placeholder="07…" className="h-10 rounded-xl" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Temporary password (optional)</Label>
        <Input
          id="password"
          name="password"
          type="text"
          placeholder="Leave blank to auto-generate"
          className="h-10 rounded-xl"
          minLength={8}
        />
        <p className="text-[11px] text-muted-foreground">
          If blank, a secure temporary password is generated and shown once after
          create.
        </p>
      </div>
      <Button type="submit" disabled={loading} className="h-11 w-full rounded-xl">
        {loading ? "Creating…" : "Create & show login details"}
      </Button>
    </form>
  );
}
