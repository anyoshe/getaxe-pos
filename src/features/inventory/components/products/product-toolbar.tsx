"use client";

import { Button } from "@/components/ui/button";
import { CrudToolbar } from "@/components/crud";

interface ProductToolbarProps {
  search: string;
  onSearchChange: (value: string) => void;
  onCreate: () => void;
  onQuickScan?: () => void;
  onBatchAdd?: () => void;
  onImport?: () => void;
}

export function ProductToolbar({
  search,
  onSearchChange,
  onCreate,
  onQuickScan,
  onBatchAdd,
  onImport,
}: ProductToolbarProps) {
  return (
    <CrudToolbar
      search={search}
      onSearchChange={onSearchChange}
      createButton={
        <div className="flex flex-wrap gap-2">
          <Button onClick={onCreate}>New Product</Button>
          {onImport && (
            <Button variant="outline" onClick={onImport}>
              Import CSV
            </Button>
          )}
          {onQuickScan && (
            <Button variant="outline" onClick={onQuickScan}>
              Quick scan
            </Button>
          )}
          {onBatchAdd && (
            <Button variant="outline" onClick={onBatchAdd}>
              Batch add
            </Button>
          )}
        </div>
      }
    />
  );
}
