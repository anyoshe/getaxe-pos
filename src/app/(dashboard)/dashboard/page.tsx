import {
    ShoppingCart,
    Package,
    Users,
    UserPlus,
    PackagePlus,
    Pill,
    AlertTriangle,
} from "lucide-react";

import { PageHeader, StatCard, QuickActionCard, SectionHeader } from "@/components/shared";


export default function DashboardPage() {
    return (
        <div className="space-y-8">

            <PageHeader
                title="Welcome back 👋"
                description="Here's what's happening across your business today. Monitor sales, inventory, customers, and daily operations from one place."
            />
            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">

                <StatCard
                    title="Today's Sales"
                    value="KSh 0"
                    subtitle="No sales yet"
                    icon={ShoppingCart}
                    gradient="bg-gradient-to-r from-indigo-600 to-violet-600"
                />

                <StatCard
                    title="Customers"
                    value="0"
                    subtitle="Registered customers"
                    icon={Users}
                    gradient="bg-gradient-to-r from-emerald-500 to-teal-500"
                />

                <StatCard
                    title="Products"
                    value="0"
                    subtitle="Available products"
                    icon={Package}
                    gradient="bg-gradient-to-r from-amber-500 to-orange-500"
                />

                <StatCard
                    title="Low Stock"
                    value="0"
                    subtitle="Requires attention"
                    icon={AlertTriangle}
                    gradient="bg-gradient-to-r from-cyan-500 to-sky-500"
                />

            </div>

            <SectionHeader
                title="Quick Actions"
                description="Frequently used tasks"
            />

            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">

                <QuickActionCard
                    title="New Sale"
                    description="Start a new customer sale."
                    href="/sales/new"
                    icon={ShoppingCart}
                />

                <QuickActionCard
                    title="New Customer"
                    description="Register a customer."
                    href="/customers/new"
                    icon={UserPlus}
                />

                <QuickActionCard
                    title="Receive Stock"
                    description="Receive supplier deliveries."
                    href="/purchases/receive"
                    icon={PackagePlus}
                />

                <QuickActionCard
                    title="Dispense Drug"
                    description="Process prescriptions."
                    href="/pharmacy/dispense"
                    icon={Pill}
                />

            </div>

        </div>
    );
}