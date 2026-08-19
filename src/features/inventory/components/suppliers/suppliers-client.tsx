"use client";

import {
  useMemo,
  useState,
} from "react";

import {
  useRouter,
} from "next/navigation";

import {
  CrudPage,
  DeleteDialog,
} from "@/components/crud";

import {
  deleteSupplierAction,
} from "../../actions/delete-supplier";

import type {
  Supplier,
} from "../../types";

import {
  SupplierDialog,
  SupplierTable,
  SupplierToolbar,
} from ".";

interface SuppliersClientProps {
  suppliers: Supplier[];
}

export function SuppliersClient({
  suppliers,
}: SuppliersClientProps) {
  const router = useRouter();

  const [search, setSearch] =
    useState("");

  const [open, setOpen] =
    useState(false);

  const [selectedSupplier, setSelectedSupplier] =
    useState<Supplier | null>(null);

  const [deleteOpen, setDeleteOpen] =
    useState(false);

  const [deleting, setDeleting] =
    useState(false);

  const filteredSuppliers =
    useMemo(() => {
      const q =
        search.trim().toLowerCase();

      if (!q) {
        return suppliers;
      }

      return suppliers.filter(
        (supplier) =>
          supplier.name
            .toLowerCase()
            .includes(q) ||
          supplier.contactPerson
            ?.toLowerCase()
            .includes(q) ||
          supplier.email
            ?.toLowerCase()
            .includes(q) ||
          supplier.phone
            ?.toLowerCase()
            .includes(q) ||
          supplier.town
            ?.toLowerCase()
            .includes(q) ||
          supplier.kraPin
            ?.toLowerCase()
            .includes(q)
      );
    }, [suppliers, search]);

  return (
    <CrudPage
      title="Suppliers"
      description="Manage inventory suppliers."
      onCreate={() => {
        setSelectedSupplier(null);
        setOpen(true);
      }}
    >
      <div className="space-y-6">
        <SupplierToolbar
          search={search}
          onSearchChange={setSearch}
          onCreate={() => {
            setSelectedSupplier(null);
            setOpen(true);
          }}
        />

        <SupplierTable
          data={filteredSuppliers}
          onEdit={(supplier) => {
            setSelectedSupplier(supplier);
            setOpen(true);
          }}
          onDelete={(supplier) => {
            setSelectedSupplier(supplier);
            setDeleteOpen(true);
          }}
        />

        <SupplierDialog
          open={open}
          onOpenChange={setOpen}
          supplier={selectedSupplier}
          onSuccess={() => {
            router.refresh();
          }}
        />

        <DeleteDialog
          open={deleteOpen}
          loading={deleting}
          title="Archive Supplier?"
          description={
            selectedSupplier
              ? `Archive "${selectedSupplier.name}"?`
              : ""
          }
          onCancel={() => {
            setDeleteOpen(false);
            setSelectedSupplier(null);
          }}
          onConfirm={async () => {
            if (!selectedSupplier) {
              return;
            }

            try {
              setDeleting(true);

              const result =
                await deleteSupplierAction(
                  selectedSupplier.id
                );

              if (!result.success) {
                return;
              }

              router.refresh();

              setDeleteOpen(false);
              setSelectedSupplier(null);
            } finally {
              setDeleting(false);
            }
          }}
        />
      </div>
    </CrudPage>
  );
}