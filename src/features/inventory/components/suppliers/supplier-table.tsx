"use client";

import {
  Edit,
  Trash2,
} from "lucide-react";

import {
  CrudTable,
  StatusBadge,
  type CrudColumn,
} from "@/components/crud";

import {
  Button,
} from "@/components/ui/button";

import type {
  Supplier,
} from "../../types";

interface SupplierTableProps {
  data: Supplier[];

  onEdit: (supplier: Supplier) => void;

  onDelete: (supplier: Supplier) => void;
}

export function SupplierTable({
  data,
  onEdit,
  onDelete,
}: SupplierTableProps) {
  const columns: CrudColumn<Supplier>[] = [
    {
      key: "name",
      title: "Supplier",
      render: (supplier) => (
        <div>
          <p className="font-semibold text-slate-800">
            {supplier.name}
          </p>

          {supplier.contactPerson && (
            <p className="text-xs text-slate-500">
              {supplier.contactPerson}
            </p>
          )}
        </div>
      ),
    },

    {
      key: "phone",
      title: "Phone",
      render: (supplier) =>
        supplier.phone || "—",
      hidden: true,
    },

    {
      key: "email",
      title: "Email",
      render: (supplier) =>
        supplier.email || "—",
      hidden: true,
    },

    {
      key: "town",
      title: "Town",
      render: (supplier) =>
        supplier.town || "—",
    },

    {
      key: "kraPin",
      title: "KRA PIN",
      render: (supplier) =>
        supplier.kraPin || "—",
      hidden: true,
    },

    {
      key: "active",
      title: "Status",
      align: "center",
      render: (supplier) => (
        <StatusBadge
          active={supplier.active}
        />
      ),
    },
  ];

  return (
    <CrudTable
      data={data}
      columns={columns}
      actions={[
        {
          label: "Edit",
          icon: (
            <Edit className="h-4 w-4" />
          ),
          onClick: onEdit,
        },
        {
          label: "Archive",
          icon: (
            <Trash2 className="h-4 w-4" />
          ),
          onClick: onDelete,
        },
      ]}
      emptyMessage="No suppliers found."
    />
  );
}