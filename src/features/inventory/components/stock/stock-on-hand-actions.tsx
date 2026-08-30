"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { buttonVariants } from "@/components/ui/button";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { OpeningStockImportDialog } from "./opening-stock-import-dialog";

export function StockOnHandActions() {
  const router = useRouter();
  const [importOpen, setImportOpen] = useState(false);

  return (
    <>
      <div className="flex flex-wrap gap-2">
        <Link
          href="/inventory/stock/receive"
          className={cn(buttonVariants({ variant: "default" }))}
        >
          Receive stock
        </Link>
        <Button type="button" variant="outline" onClick={() => setImportOpen(true)}>
          Import opening stock
        </Button>
        <Link href="/inventory/adjustments" className={cn(buttonVariants({ variant: "outline" }))}>
          Adjust
        </Link>
        <Link href="/inventory/transfers" className={cn(buttonVariants({ variant: "outline" }))}>
          Transfer
        </Link>
        <Link href="/inventory/batches" className={cn(buttonVariants({ variant: "outline" }))}>
          Batches
        </Link>
        <Link href="/inventory/stock-movements" className={cn(buttonVariants({ variant: "outline" }))}>
          Movements
        </Link>
      </div>
      <OpeningStockImportDialog
        open={importOpen}
        onOpenChange={setImportOpen}
        onImported={() => router.refresh()}
      />
    </>
  );
}
