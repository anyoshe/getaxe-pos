"use client";

import {
  CrudToolbar,
} from "@/components/crud";

interface ProductPriceToolbarProps {
  search: string;

  onSearchChange: (
    value: string
  ) => void;
}

export function ProductPriceToolbar({
  search,
  onSearchChange,
}: ProductPriceToolbarProps) {
  return (
    <CrudToolbar
      search={search}
      onSearchChange={onSearchChange}
    />
  );
}