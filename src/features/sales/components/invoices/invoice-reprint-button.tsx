"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  SaleReceipt,
  type ReceiptBusiness,
  type ReceiptData,
} from "@/features/sales/components/pos/sale-receipt";

export function InvoiceReprintButton({
  business,
  receipt,
}: {
  business: ReceiptBusiness;
  receipt: ReceiptData;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button type="button" variant="outline" onClick={() => setOpen(true)}>
        Reprint receipt
      </Button>
      {open ? (
        <SaleReceipt
          open={open}
          business={business}
          receipt={receipt}
          onClose={() => setOpen(false)}
          autoPrint={false}
        />
      ) : null}
    </>
  );
}
