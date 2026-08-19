"use client";

import {
  CrudToolbar,
} from "@/components/crud";

interface CategoryToolbarProps {
  search: string;
  onSearchChange: (
    value: string
  ) => void;
}

export function CategoryToolbar({
  search,
  onSearchChange,
}: CategoryToolbarProps) {
  return (
    <CrudToolbar
      search={search}
      onSearchChange={onSearchChange}
    />
  );
}