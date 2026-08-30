import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  gradient: string;
}

export function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  gradient,
}: StatCardProps) {
  return (
    <div
      className={`rounded-3xl ${gradient} p-6 text-white shadow-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl`}
    >
      <div className="flex items-center justify-between">

        <div>

          <p className="text-sm opacity-90">
            {title}
          </p>

          <h2 className="mt-3 text-3xl font-bold">
            {value}
          </h2>

          {subtitle && (
            <p className="mt-2 text-sm opacity-80">
              {subtitle}
            </p>
          )}

        </div>

        <div className="rounded-2xl bg-card/20 p-4">

          <Icon size={28} />

        </div>

      </div>
    </div>
  );
}