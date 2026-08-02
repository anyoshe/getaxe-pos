"use client";

import { useMemo, useState } from "react";

import {
    CrudPage,
    DeleteDialog,
} from "@/components/crud";

import {
    deleteProductAction,
} from "../../actions";

import {
    ProductToolbar,
    ProductTable,
    ProductDialog,
} from ".";

import {
    useRouter,
} from "next/navigation";

import type {
    Product,
    ProductContext,
} from "../../types";

interface ProductsClientProps {
    products: Product[];

    context: ProductContext;
}


export function ProductsClient({
    products,
    context,
}: ProductsClientProps) {

    const router = useRouter();

    const [search, setSearch] =
        useState("");

    const [open, setOpen] =
        useState(false);

    const [selectedProduct, setSelectedProduct] =
        useState<Product | null>(null);

    const [deleteOpen, setDeleteOpen] =
        useState(false);

    const [deleting, setDeleting] =
        useState(false);

    const filteredProducts =
        useMemo(
            () =>
                products.filter((product) => {

                    const q =
                        search.toLowerCase();

                    return (
                        product.name
                            .toLowerCase()
                            .includes(q) ||

                        product.sku
                            ?.toLowerCase()
                            .includes(q) ||

                        product.barcode
                            ?.toLowerCase()
                            .includes(q)
                    );

                }),
            [products, search]
        );

    return (

        <CrudPage
            title="Products"
            description="Manage inventory products."
        >

            <div className="space-y-6">

                <ProductToolbar
                    search={search}
                    onSearchChange={setSearch}
                    onCreate={() => {
                        setSelectedProduct(null);
                        setOpen(true);
                    }}
                />

                <ProductTable
                    data={filteredProducts}
                    onEdit={(product) => {
                        setSelectedProduct(product);
                        setOpen(true);
                    }}
                    onDelete={(product) => {
                        setSelectedProduct(product);
                        setDeleteOpen(true);
                    }}
                />

                <ProductDialog
                    open={open}
                    onOpenChange={setOpen}
                    product={selectedProduct}
                    context={context}
                    onSuccess={() => {
                        router.refresh();
                    }}
                />
                <DeleteDialog
                    open={deleteOpen}
                    loading={deleting}
                    title="Delete Product?"
                    description={
                        selectedProduct
                            ? `Archive "${selectedProduct.name}"?`
                            : ""
                    }
                    onCancel={() => {
                        setDeleteOpen(false);
                        setSelectedProduct(null);
                    }}
                    onConfirm={async () => {

                        if (!selectedProduct)
                            return;

                        try {

                            setDeleting(true);

                            await deleteProductAction(
                                selectedProduct.id
                            );

                            router.refresh();

                            setDeleteOpen(false);

                            setSelectedProduct(null);

                        } finally {

                            setDeleting(false);

                        }

                    }}
                />

            </div>

        </CrudPage>

    );

}