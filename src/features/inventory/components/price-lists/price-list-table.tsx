"use client";

import {
  Edit,
  Trash2,
} from "lucide-react";

import {
  CrudTable,
  StatusBadge,
} from "@/components/crud";

import type {
  PriceList,
} from "../../types/price-lists";

interface PriceListTableProps {
  data: PriceList[];

  onEdit: (
    priceList: PriceList
  ) => void;

  onDelete: (
    priceList: PriceList
  ) => void;
}

export function PriceListTable({
  data,
  onEdit,
  onDelete,
}: PriceListTableProps) {
  return (
    <CrudTable
      data={data}
      columns={[
        {
          key: "code",
          title: "Code",
        },
        {
          key: "name",
          title: "Name",
        },
        {
          key: "description",
          title: "Description",
          render: (priceList) =>
            priceList.description || "—",
          hidden: true,
        },
        {
          key: "isDefault",
          title: "Default",
          render: (priceList) =>
            priceList.isDefault
              ? "Yes"
              : "No",
        },
        {
          key: "active",
          title: "Status",
          render: (priceList) => (
            <StatusBadge
              active={priceList.active}
            />
          ),
        },
      ]}
      actions={[
        {
          label: "Edit",
          icon: (
            <Edit className="h-4 w-4" />
          ),
          onClick: onEdit,
        },
        {
          label: "Delete",
          icon: (
            <Trash2 className="h-4 w-4" />
          ),
          onClick: onDelete,
        },
      ]}
      emptyMessage="No price lists found."
    />
  );
}
