import Link from "next/link";

export function PlatformDashboard() {
  return (
    <main className="mx-auto flex max-w-7xl flex-col gap-8 p-8">
      <div>
        <h1 className="text-3xl font-bold">
          Platform Administration
        </h1>

        <p className="mt-2 text-muted-foreground">
          Manage business owners and businesses.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        <DashboardCard
          title="Business Owners"
          value="0"
        />

        <DashboardCard
          title="Businesses"
          value="0"
        />

        <DashboardCard
          title="Active Businesses"
          value="0"
        />

        <DashboardCard
          title="Pending Setup"
          value="0"
        />
      </div>

      <div className="flex gap-4">
        <Link
          href="/platform/business-owners"
          className="rounded-md bg-indigo-600 px-5 py-3 text-white hover:bg-indigo-700"
        >
          Business Owners
        </Link>

        <Link
          href="/platform/businesses"
          className="rounded-md border px-5 py-3 hover:bg-muted"
        >
          Businesses
        </Link>
      </div>
    </main>
  );
}

function DashboardCard({
  title,
  value,
}: {
  title: string;
  value: string;
}) {
  return (
    <div className="rounded-lg border p-6">
      <p className="text-sm text-muted-foreground">
        {title}
      </p>

      <h2 className="mt-3 text-3xl font-bold">
        {value}
      </h2>
    </div>
  );
}