import {
  ArrowDownRight,
  ArrowUpRight,
  Boxes,
  CalendarClock,
  CircleDollarSign,
  Package,
  TriangleAlert,
  Warehouse,
  ArrowRight,
} from "lucide-react";

import { getCurrentUser } from "@/lib/auth/current-user";

import {
  getStockOnHand,
  getLowStockProducts,
  getExpiryStock,
  getStockValuation,
  getStockMovements,
} from "@/features/inventory/queries";

function formatNumber(value: number) {
  return new Intl.NumberFormat("en-KE", {
    maximumFractionDigits: 2,
  }).format(value);
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency: "KES",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatDate(value: Date | string) {
  return new Intl.DateTimeFormat("en-KE", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

export default async function InventoryPage() {
  const user = await getCurrentUser();

  if (!user) {
    return null;
  }

  const [stockOnHand, lowStock, expiringStock, valuation, movements] =
    await Promise.all([
      getStockOnHand({
        businessId: user.businessId,
      }),

      getLowStockProducts({
        businessId: user.businessId,
      }),

      getExpiryStock({
        businessId: user.businessId,
        expired: false,
      }),

      getStockValuation({
        businessId: user.businessId,
      }),

      getStockMovements({
        businessId: user.businessId,
      }),
    ]);

  const totalQuantity = stockOnHand.reduce(
    (sum, item) => sum + Number(item.quantity ?? 0),
    0,
  );

  const totalStockValue = valuation.reduce(
    (sum, item) => sum + Number(item.stockValue ?? 0),
    0,
  );

  const warehouseCount = new Set(stockOnHand.map((item) => item.warehouseId))
    .size;

  const productCount = new Set(stockOnHand.map((item) => item.productId)).size;

  const recentMovements = movements.slice(0, 8);

  const criticalLowStock = lowStock.slice(0, 6);

  const upcomingExpiry = expiringStock.slice(0, 6);

  return (
    <main className="space-y-8">
      {/* Header */}

      <section className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2 text-sm font-medium text-indigo-600">
            <Boxes className="h-4 w-4" />
            Inventory
          </div>

          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Inventory Overview
          </h1>

          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            Monitor stock levels, inventory value, warehouse activity, low-stock
            items, and upcoming expiries from one place.
          </p>
        </div>
      </section>

      {/* KPI Cards */}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Stock Quantity
              </p>

              <p className="mt-2 text-2xl font-bold text-foreground">
                {formatNumber(totalQuantity)}
              </p>
            </div>

            <div className="rounded-xl bg-indigo-50 p-3 text-indigo-600">
              <Boxes className="h-5 w-5" />
            </div>
          </div>

          <p className="mt-4 text-xs text-muted-foreground">
            Across {warehouseCount} warehouse{warehouseCount === 1 ? "" : "s"}
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Inventory Value
              </p>

              <p className="mt-2 text-2xl font-bold text-foreground">
                {formatCurrency(totalStockValue)}
              </p>
            </div>

            <div className="rounded-xl bg-emerald-50 p-3 text-emerald-600">
              <CircleDollarSign className="h-5 w-5" />
            </div>
          </div>

          <p className="mt-4 text-xs text-muted-foreground">
            Current estimated stock value
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Low Stock</p>

              <p className="mt-2 text-2xl font-bold text-foreground">
                {lowStock.length}
              </p>
            </div>

            <div className="rounded-xl bg-amber-50 p-3 text-amber-600">
              <TriangleAlert className="h-5 w-5" />
            </div>
          </div>

          <p className="mt-4 text-xs text-muted-foreground">
            Products requiring attention
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Tracked Products
              </p>

              <p className="mt-2 text-2xl font-bold text-foreground">
                {productCount}
              </p>
            </div>

            <div className="rounded-xl bg-violet-50 p-3 text-violet-600">
              <Package className="h-5 w-5" />
            </div>
          </div>

          <p className="mt-4 text-xs text-muted-foreground">
            Products currently holding stock
          </p>
        </div>
      </section>

      {/* Main Dashboard */}

      <section className="grid gap-6 xl:grid-cols-3">
        {/* Stock Distribution */}

        <div className="xl:col-span-2 rounded-2xl border border-border bg-card shadow-sm">
          <div className="flex items-center justify-between border-b border-border px-6 py-5">
            <div>
              <h2 className="font-semibold text-foreground">
                Stock by Warehouse
              </h2>

              <p className="mt-1 text-sm text-muted-foreground">
                Current stock distribution across your warehouses.
              </p>
            </div>

            <Warehouse className="h-5 w-5 text-muted-foreground" />
          </div>

          <div className="divide-y divide-border">
            {stockOnHand.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <Boxes className="mx-auto h-8 w-8 text-muted-foreground" />

                <p className="mt-3 text-sm text-muted-foreground">
                  No stock currently available.
                </p>
              </div>
            ) : (
              stockOnHand.slice(0, 8).map((item) => (
                <div
                  key={`${item.productId}-${item.warehouseId}`}
                  className="flex items-center justify-between gap-4 px-6 py-4"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-foreground">
                      {item.productName}
                    </p>

                    <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                      <Warehouse className="h-3.5 w-3.5" />
                      {item.warehouseName}
                    </p>
                  </div>

                  <p className="shrink-0 text-sm font-semibold text-foreground">
                    {formatNumber(Number(item.quantity))}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Attention */}

        <div className="rounded-2xl border border-border bg-card shadow-sm">
          <div className="border-b border-border px-6 py-5">
            <div className="flex items-center gap-2">
              <TriangleAlert className="h-5 w-5 text-amber-500" />

              <h2 className="font-semibold text-foreground">
                Attention Required
              </h2>
            </div>

            <p className="mt-1 text-sm text-muted-foreground">
              Inventory items that need action.
            </p>
          </div>

          <div className="space-y-3 p-5">
            <div className="rounded-xl border border-amber-100 bg-amber-50/60 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    Low Stock
                  </p>

                  <p className="mt-1 text-xs text-muted-foreground">
                    Below reorder level
                  </p>
                </div>

                <span className="text-xl font-bold text-amber-600">
                  {lowStock.length}
                </span>
              </div>
            </div>

            <div className="rounded-xl border border-orange-100 bg-orange-50/60 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    Upcoming Expiry
                  </p>

                  <p className="mt-1 text-xs text-muted-foreground">
                    Batches approaching expiry
                  </p>
                </div>

                <span className="text-xl font-bold text-orange-600">
                  {upcomingExpiry.length}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Low Stock + Expiry */}

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-border bg-card shadow-sm">
          <div className="flex items-center justify-between border-b border-border px-6 py-5">
            <div>
              <h2 className="font-semibold text-foreground">Low Stock</h2>

              <p className="mt-1 text-sm text-muted-foreground">
                Products at or below their reorder level.
              </p>
            </div>

            <TriangleAlert className="h-5 w-5 text-amber-500" />
          </div>

          <div className="divide-y divide-border">
            {criticalLowStock.length === 0 ? (
              <div className="px-6 py-10 text-center text-sm text-muted-foreground">
                No low-stock products.
              </div>
            ) : (
              criticalLowStock.map((item) => (
                <div
                  key={`${item.productId}-${item.warehouseId}`}
                  className="flex items-center justify-between gap-4 px-6 py-4"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-foreground">
                      {item.productName}
                    </p>

                    <p className="mt-1 text-xs text-muted-foreground">
                      {item.sku || "No SKU"} · {item.warehouseName}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="text-sm font-bold text-amber-600">
                      {formatNumber(Number(item.currentQuantity))}
                    </p>

                    <p className="text-xs text-muted-foreground">
                      reorder {formatNumber(Number(item.reorderLevel))}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card shadow-sm">
          <div className="flex items-center justify-between border-b border-border px-6 py-5">
            <div>
              <h2 className="font-semibold text-foreground">Upcoming Expiry</h2>

              <p className="mt-1 text-sm text-muted-foreground">
                Batches with upcoming expiry dates.
              </p>
            </div>

            <CalendarClock className="h-5 w-5 text-orange-500" />
          </div>

          <div className="divide-y divide-border">
            {upcomingExpiry.length === 0 ? (
              <div className="px-6 py-10 text-center text-sm text-muted-foreground">
                No upcoming expiries.
              </div>
            ) : (
              upcomingExpiry.map((item) => (
                <div
                  key={`${item.productId}-${item.batchNumber}`}
                  className="flex items-center justify-between gap-4 px-6 py-4"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-foreground">
                      {item.productName}
                    </p>

                    <p className="mt-1 text-xs text-muted-foreground">
                      Batch {item.batchNumber}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="text-sm font-semibold text-orange-600">
                      {item.expiryDate ? formatDate(item.expiryDate) : "—"}
                    </p>

                    <p className="text-xs text-muted-foreground">
                      {formatNumber(Number(item.quantityRemaining))} remaining
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Recent Activity */}

      <section className="rounded-2xl border border-border bg-card shadow-sm">
        <div className="flex items-center justify-between border-b border-border px-6 py-5">
          <div>
            <h2 className="font-semibold text-foreground">
              Recent Stock Activity
            </h2>

            <p className="mt-1 text-sm text-muted-foreground">
              Latest inventory movements across the business.
            </p>
          </div>

          <ArrowRight className="h-5 w-5 text-muted-foreground" />
        </div>

        <div className="divide-y divide-border">
          {recentMovements.length === 0 ? (
            <div className="px-6 py-12 text-center text-sm text-muted-foreground">
              No stock movements recorded yet.
            </div>
          ) : (
            recentMovements.map((movement) => {
              const incoming = Number(movement.quantity) > 0;

              return (
                <div
                  key={movement.id}
                  className="flex items-center justify-between gap-4 px-6 py-4"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <div
                      className={`rounded-xl p-2 ${
                        incoming
                          ? "bg-emerald-50 text-emerald-600"
                          : "bg-rose-50 text-rose-600"
                      }`}
                    >
                      {incoming ? (
                        <ArrowUpRight className="h-4 w-4" />
                      ) : (
                        <ArrowDownRight className="h-4 w-4" />
                      )}
                    </div>

                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-foreground">
                        {movement.productName}
                      </p>

                      <p className="mt-1 text-xs text-muted-foreground">
                        {movement.movementType} · {movement.warehouseName}
                      </p>
                    </div>
                  </div>

                  <div className="shrink-0 text-right">
                    <p
                      className={`text-sm font-bold ${
                        incoming ? "text-emerald-600" : "text-rose-600"
                      }`}
                    >
                      {incoming ? "+" : ""}
                      {formatNumber(Number(movement.quantity))}
                    </p>

                    <p className="text-xs text-muted-foreground">
                      {formatDate(movement.createdAt)}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </section>
    </main>
  );
}
