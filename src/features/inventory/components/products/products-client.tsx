"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import { CrudPage, DeleteDialog } from "@/components/crud";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { deleteProductAction } from "../../actions";
import { ProductToolbar, ProductTable, ProductDialog } from ".";
import { ProductImportDialog } from "./product-import-dialog";

import type { Product, ProductContext } from "../../types";

interface ProductsClientProps {
  products: Product[];
  context: ProductContext;
  pagination?: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
    search: string;
  };
}

export function ProductsClient({
  products,
  context,
  pagination,
}: ProductsClientProps) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [search, setSearch] = useState(pagination?.search ?? "");
  const [open, setOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [entryMode, setEntryMode] = useState<"wizard" | "quick" | "batch">(
    "wizard",
  );
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const page = pagination?.page ?? 1;
  const totalPages = pagination?.totalPages ?? 1;
  const total = pagination?.total ?? products.length;

  function applySearch(nextQ: string) {
    const params = new URLSearchParams();
    if (nextQ.trim()) params.set("q", nextQ.trim());
    params.set("page", "1");
    start(() => {
      router.push(`/inventory/products?${params.toString()}`);
    });
  }

  function goPage(p: number) {
    const params = new URLSearchParams();
    if (search.trim()) params.set("q", search.trim());
    params.set("page", String(p));
    start(() => {
      router.push(`/inventory/products?${params.toString()}`);
    });
  }

  return (
    <CrudPage
      title="Products"
      description={`Paged catalogue (${total.toLocaleString()} products). Search loads from the server — not only this page.`}
    >
      <div className="space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <form
            className="flex flex-1 gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              applySearch(search);
            }}
          >
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search name, SKU, barcode…"
              className="max-w-md"
            />
            <Button type="submit" disabled={pending}>
              Search
            </Button>
            {pagination?.search ? (
              <Button
                type="button"
                variant="outline"
                disabled={pending}
                onClick={() => {
                  setSearch("");
                  applySearch("");
                }}
              >
                Clear
              </Button>
            ) : null}
          </form>
          <ProductToolbar
            search={search}
            onSearchChange={setSearch}
            onImport={() => setImportOpen(true)}
            onCreate={() => {
              setSelectedProduct(null);
              setEntryMode("wizard");
              setOpen(true);
            }}
            onQuickScan={() => {
              setSelectedProduct(null);
              setEntryMode("quick");
              setOpen(true);
            }}
            onBatchAdd={() => {
              setSelectedProduct(null);
              setEntryMode("batch");
              setOpen(true);
            }}
          />
        </div>

        <ProductTable
          data={products}
          onEdit={(product) => {
            setSelectedProduct(product);
            setOpen(true);
          }}
          onDelete={(product) => {
            setSelectedProduct(product);
            setDeleteOpen(true);
          }}
        />

        {totalPages > 1 ? (
          <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
            <p className="text-muted-foreground">
              Page {page} of {totalPages} · {total.toLocaleString()} total
            </p>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={pending || page <= 1}
                onClick={() => goPage(page - 1)}
              >
                Previous
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={pending || page >= totalPages}
                onClick={() => goPage(page + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        ) : null}

        <ProductDialog
          open={open}
          onOpenChange={setOpen}
          product={selectedProduct}
          context={context}
          initialMode={entryMode}
          onSuccess={() => {
            router.refresh();
          }}
        />
        <DeleteDialog
          open={deleteOpen}
          loading={deleting}
          title="Delete Product?"
          description={
            selectedProduct ? `Archive "${selectedProduct.name}"?` : ""
          }
          onCancel={() => {
            setDeleteOpen(false);
            setSelectedProduct(null);
          }}
          onConfirm={async () => {
            if (!selectedProduct) return;
            try {
              setDeleting(true);
              await deleteProductAction(selectedProduct.id);
              router.refresh();
              setDeleteOpen(false);
              setSelectedProduct(null);
            } finally {
              setDeleting(false);
            }
          }}
        />

        <ProductImportDialog
          open={importOpen}
          onOpenChange={setImportOpen}
          onImported={() => router.refresh()}
        />
      </div>
    </CrudPage>
  );
}
