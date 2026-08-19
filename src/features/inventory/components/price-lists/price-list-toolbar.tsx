"use client";

import {
  CrudToolbar,
} from "@/components/crud";

interface PriceListToolbarProps {
  search: string;
  onSearchChange: (
    value: string
  ) => void;
}

export function PriceListToolbar({
  search,
  onSearchChange,
}: PriceListToolbarProps) {
  return (
    <CrudToolbar
      search={search}
      onSearchChange={onSearchChange}
    />
  );
}
