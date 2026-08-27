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
  deleteProductPriceAction,
} from "../../actions/delete-product-price";

import {
  ProductPrice,
} from "../../types/product-prices";

import {
  Product,
} from "../../types/products";

import {
  PriceList,
} from "../../types/price-lists";

import {
  ProductPriceDialog,
} from "./product-price-dialog";

import {
  ProductPriceTable,
} from "./product-price-table";

import {
  ProductPriceToolbar,
} from "./product-price-toolbar";

interface ProductPricesClientProps {
  productPrices: ProductPrice[];

  products: Product[];

  priceLists: PriceList[];

  units?: { id: string; name: string }[];
}

export function ProductPricesClient({
  productPrices,
  products,
  priceLists,
  units = [],
}: ProductPricesClientProps) {
  const router =
    useRouter();

  const [search, setSearch] =
    useState("");

  const [open, setOpen] =
    useState(false);

  const [
    selectedProductPrice,
    setSelectedProductPrice,
  ] = useState<ProductPrice | null>(
    null
  );

  const [
    deleteOpen,
    setDeleteOpen,
  ] = useState(false);

  const [deleting, setDeleting] =
    useState(false);

  const filteredProductPrices =
    useMemo(() => {
      const query =
        search
          .trim()
          .toLowerCase();

      if (!query) {
        return productPrices;
      }

      return productPrices.filter(
        (productPrice) =>
          productPrice.product.name
            .toLowerCase()
            .includes(query) ||

          productPrice.product.sku
            ?.toLowerCase()
            .includes(query) ||

          productPrice.product.barcode
            ?.toLowerCase()
            .includes(query) ||

          productPrice.priceList.name
            .toLowerCase()
            .includes(query) ||

          productPrice.priceList.code
            .toLowerCase()
            .includes(query)
      );
    }, [
      productPrices,
      search,
    ]);

  return (
    <CrudPage
      title="Product Prices"
      description="Manage product pricing across your price lists."
      createLabel="Create Product Price"
      onCreate={() => {
        setSelectedProductPrice(null);
        setOpen(true);
      }}
    >
      <div className="space-y-6">
               <ProductPriceToolbar
          search={search}
          onSearchChange={setSearch}
        />

        <ProductPriceTable
          data={filteredProductPrices}
          onEdit={(productPrice) => {
            setSelectedProductPrice(
              productPrice
            );
            setOpen(true);
          }}
          onDelete={(productPrice) => {
            setSelectedProductPrice(
              productPrice
            );
            setDeleteOpen(true);
          }}
        />

        <ProductPriceDialog
          open={open}
          onOpenChange={setOpen}
          productPrice={
            selectedProductPrice
          }
          products={products}
          priceLists={priceLists}
          onSuccess={() => {
            router.refresh();
          }}
        />

        <DeleteDialog
          open={deleteOpen}
          loading={deleting}
          title="Archive Product Price?"
          description={
            selectedProductPrice
              ? `Archive the price for "${selectedProductPrice.product.name}"?`
              : ""
          }
          onCancel={() => {
            setDeleteOpen(false);
            setSelectedProductPrice(null);
          }}
          onConfirm={async () => {
            if (!selectedProductPrice) {
              return;
            }

            try {
              setDeleting(true);

              const result =
                await deleteProductPriceAction(
                  selectedProductPrice.id
                );

              if (!result.success) {
                return;
              }

              router.refresh();

              setDeleteOpen(false);
              setSelectedProductPrice(null);
            } finally {
              setDeleting(false);
            }
          }}
        />
      </div>
    </CrudPage>
  );
}