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
  deletePriceListAction,
} from "../../actions/delete-price-list";

import {
  PriceListDialog,
} from "./price-list-dialog";

import {
  PriceListTable,
} from "./price-list-table";

import {
  PriceListToolbar,
} from "./price-list-toolbar";

import type {
  PriceList,
} from "../../types/price-lists";

interface PriceListsClientProps {
  priceLists: PriceList[];
}

export function PriceListsClient({
  priceLists,
}: PriceListsClientProps) {
  const router =
    useRouter();

  const [search, setSearch] =
    useState("");

  const [open, setOpen] =
    useState(false);

  const [
    selectedPriceList,
    setSelectedPriceList,
  ] = useState<PriceList | null>(
    null
  );

  const [
    deleteOpen,
    setDeleteOpen,
  ] = useState(false);

  const [deleting, setDeleting] =
    useState(false);

  const filteredPriceLists =
    useMemo(() => {
      const query =
        search
          .trim()
          .toLowerCase();

      if (!query) {
        return priceLists;
      }

      return priceLists.filter(
        (priceList) =>
          priceList.code
            .toLowerCase()
            .includes(query) ||
          priceList.name
            .toLowerCase()
            .includes(query) ||
          priceList.description
            ?.toLowerCase()
            .includes(query)
      );
    }, [priceLists, search]);

  return (
    <CrudPage
      title="Price Lists"
      description="Manage inventory price lists."
      createLabel="Create Price List"
      onCreate={() => {
        setSelectedPriceList(null);
        setOpen(true);
      }}
    >
      <div className="space-y-6">
        <PriceListToolbar
          search={search}
          onSearchChange={setSearch}
        />

        <PriceListTable
          data={filteredPriceLists}
          onEdit={(priceList) => {
            setSelectedPriceList(
              priceList
            );
            setOpen(true);
          }}
          onDelete={(priceList) => {
            setSelectedPriceList(
              priceList
            );
            setDeleteOpen(true);
          }}
        />

        <PriceListDialog
          open={open}
          onOpenChange={setOpen}
          priceList={
            selectedPriceList
          }
          onSuccess={() => {
            router.refresh();
          }}
        />

        <DeleteDialog
          open={deleteOpen}
          loading={deleting}
          title="Archive Price List?"
          description={
            selectedPriceList
              ? `Archive "${selectedPriceList.name}"?`
              : ""
          }
          onCancel={() => {
            setDeleteOpen(false);
            setSelectedPriceList(null);
          }}
          onConfirm={async () => {
            if (!selectedPriceList) {
              return;
            }

            try {
              setDeleting(true);

              const result =
                await deletePriceListAction(
                  selectedPriceList.id
                );

              if (!result.success) {
                return;
              }

              router.refresh();

              setDeleteOpen(false);
              setSelectedPriceList(null);
            } finally {
              setDeleting(false);
            }
          }}
        />
      </div>
    </CrudPage>
  );
}
