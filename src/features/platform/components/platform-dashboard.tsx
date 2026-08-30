"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Building2, UserPlus, Users, Clock } from "lucide-react";

import { getPlatformStatsAction } from "../actions/get-platform-stats";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function PlatformDashboard() {
  const [stats, setStats] = useState({
    owners: 0,
    businesses: 0,
    activeBusinesses: 0,
    pendingSetup: 0,
  });

  useEffect(() => {
    void getPlatformStatsAction().then((r) => {
      if (r.success) {
        setStats({
          owners: r.owners,
          businesses: r.businesses,
          activeBusinesses: r.activeBusinesses,
          pendingSetup: r.pendingSetup,
        });
      }
    });
  }, []);

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-primary">
          Platform
        </p>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          Administration
        </h1>
        <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
          Invite business owners with temporary login credentials. They sign in,
          complete business setup (type, branch, warehouse), and the ERP is
          provisioned with capabilities for that industry.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card title="Business owners" value={stats.owners} icon={Users} tone="primary" />
        <Card title="Businesses" value={stats.businesses} icon={Building2} tone="chart-3" />
        <Card title="Active businesses" value={stats.activeBusinesses} icon={Building2} tone="chart-4" />
        <Card title="Pending setup" value={stats.pendingSetup} icon={Clock} tone="chart-2" />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-primary/20 bg-primary/[0.04] p-5 shadow-sm">
          <div className="mb-2 flex items-center gap-2 text-primary">
            <UserPlus className="h-5 w-5" />
            <h2 className="font-semibold">1. Invite an owner</h2>
          </div>
          <p className="mb-4 text-sm text-muted-foreground">
            Create a client account and share email + temporary password. They
            log in at the main app login page.
          </p>
          <Link
            href="/platform/business-owners"
            className={cn(buttonVariants(), "rounded-xl")}
          >
            Manage business owners
          </Link>
        </div>
        <div className="rounded-2xl border border-chart-3/30 bg-chart-3/10 p-5 shadow-sm">
          <div className="mb-2 flex items-center gap-2 text-chart-3">
            <Building2 className="h-5 w-5" />
            <h2 className="font-semibold">2. Owner completes setup</h2>
          </div>
          <p className="mb-4 text-sm text-muted-foreground">
            At /setup they choose business type (pharmacy, retail, hardware,
            etc.). Capabilities, finance defaults, warehouse, and admin user are
            created automatically.
          </p>
          <Link
            href="/platform/businesses"
            className={cn(buttonVariants({ variant: "outline" }), "rounded-xl")}
          >
            View businesses
          </Link>
        </div>
      </div>
    </div>
  );
}

function Card({
  title,
  value,
  icon: Icon,
  tone,
}: {
  title: string;
  value: number;
  icon: typeof Users;
  tone: string;
}) {
  return (
    <div className="rounded-2xl border bg-card p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{title}</p>
        <Icon className={`h-4 w-4 text-${tone}`} />
      </div>
      <p className="mt-2 text-3xl font-bold tabular-nums text-primary">{value}</p>
    </div>
  );
}
