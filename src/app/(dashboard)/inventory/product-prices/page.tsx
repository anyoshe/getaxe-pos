import Link from "next/link";

import { getCurrentUser } from "@/lib/auth/current-user";

import {
  productService,
  priceListService,
  productPriceService,
} from "@/features/inventory/services";
import { unitsService } from "@/features/settings/services/units.service";

import { ProductPricesClient } from "@/features/inventory/components/product-prices";

function isMissingColumnError(err: unknown): boolean {
  const msg = err instanceof Error ? err.message : String(err);
  return (
    /last_purchase_cost|markup_percent|price_locked/i.test(msg) ||
    /column .* does not exist/i.test(msg) ||
    /42703/.test(msg)
  );
}

export default async function Page() {
  const user = await getCurrentUser();

  if (!user) {
    return null;
  }

  try {
    const [products, priceLists, productPrices, units] = await Promise.all([
      productService.getProducts(user.businessId),
      priceListService.getPriceLists(user.businessId),
      productPriceService.getProductPrices(user.businessId),
      unitsService.getUnits(user.businessId),
    ]);

    return (
      <ProductPricesClient
        units={units.map((u) => ({ id: u.id, name: u.name }))}
        products={products as any}
        priceLists={priceLists}
        productPrices={productPrices}
      />
    );
  } catch (err) {
    const missing = isMissingColumnError(err);
    const detail =
      process.env.NODE_ENV === "development" && err instanceof Error
        ? err.message
        : null;

    return (
      <div className="mx-auto max-w-2xl space-y-4 p-6">
        <h1 className="text-xl font-semibold text-foreground">
          Product prices couldn’t load
        </h1>
        {missing ? (
          <div className="rounded-lg border border-amber-500/40 bg-amber-500/10 p-4 text-sm text-foreground">
            <p className="font-medium">Database migration required</p>
            <p className="mt-2 text-muted-foreground">
              Production is missing columns from migration{" "}
              <code className="rounded bg-muted px-1">0036_product_costing_markup</code>{" "}
              (<span className="whitespace-nowrap">
                (last_purchase_cost, markup_percent, price_locked)
              </span>
              . Apply it on your Neon database, then reload this page.
            </p>
            <ol className="mt-3 list-decimal space-y-1 pl-5 text-muted-foreground">
              <li>
                Open Neon → SQL Editor (or run locally:{" "}
                <code className="rounded bg-muted px-1">
                  DATABASE_URL=… pnpm db:migrate
                </code>
                )
              </li>
              <li>Run the SQL in migration 0036 (IF NOT EXISTS is safe)</li>
              <li>Hard-refresh this page</li>
            </ol>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            A server error occurred while loading prices. Check Vercel logs for
            this route, or try again after a refresh.
          </p>
        )}
        {detail ? (
          <pre className="overflow-auto rounded-md border bg-muted/50 p-3 text-xs">
            {detail}
          </pre>
        ) : null}
        <Link
          href="/inventory/products"
          className="inline-flex text-sm font-medium text-primary underline-offset-4 hover:underline"
        >
          ← Back to products
        </Link>
      </div>
    );
  }
}
