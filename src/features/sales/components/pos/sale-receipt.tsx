"use client";

import { useEffect, useRef } from "react";

import { Button } from "@/components/ui/button";

export type ReceiptBusiness = {
  name: string;
  legalName?: string | null;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  town?: string | null;
  county?: string | null;
  kraPin?: string | null;
  registrationNumber?: string | null;
  logo?: string | null;
  currency?: string | null;
};

export type ReceiptLine = {
  name: string;
  quantity: number;
  unitLabel?: string | null;
  unitPrice: number;
  total: number;
};

export type ReceiptData = {
  invoiceNumber: string;
  soldAt: string;
  cashierName?: string | null;
  customerName?: string | null;
  customerPhone?: string | null;
  paymentMethod: string;
  isCredit: boolean;
  amountPaid: number;
  balanceDue: number;
  subtotal: number;
  total: number;
  lines: ReceiptLine[];
  notes?: string | null;
};

function money(n: number, currency = "KES") {
  return `${currency} ${Number(n || 0).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function SaleReceipt({
  business,
  receipt,
  open,
  onClose,
  autoPrint = false,
}: {
  business: ReceiptBusiness;
  receipt: ReceiptData;
  open: boolean;
  onClose: () => void;
  autoPrint?: boolean;
}) {
  const printed = useRef(false);

  useEffect(() => {
    if (!open) {
      printed.current = false;
      return;
    }
    if (autoPrint && !printed.current) {
      printed.current = true;
      const t = setTimeout(() => window.print(), 500);
      return () => clearTimeout(t);
    }
  }, [open, autoPrint]);

  if (!open) return null;

  const currency = business.currency || "KES";
  const addressLine = [business.address, business.town, business.county]
    .filter(Boolean)
    .join(", ");

  return (
    <>
      <style
        dangerouslySetInnerHTML={{
          __html: `
          @media print {
            @page { margin: 4mm; size: 80mm auto; }
            html, body {
              background: #fff !important;
              color: #000 !important;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            body * { visibility: hidden !important; }
            .pos-receipt-print, .pos-receipt-print * {
              visibility: visible !important;
              color: #000 !important;
              background: #fff !important;
              border-color: #000 !important;
            }
            .pos-receipt-print {
              position: absolute;
              left: 0;
              top: 0;
              width: 80mm;
              max-width: 100%;
              padding: 2mm 4mm;
              font-size: 11px;
              line-height: 1.35;
              font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
            }
            .pos-receipt-print table { width: 100%; border-collapse: collapse; }
            .pos-receipt-print th, .pos-receipt-print td {
              color: #000 !important;
              padding: 2px 0;
              vertical-align: top;
            }
            .pos-receipt-print img {
              max-height: 48px;
              filter: none !important;
            }
            .no-print { display: none !important; }
          }
        `,
        }}
      />

      {/* On-screen dialog */}
      <div className="no-print fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
        <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-xl bg-white p-4 text-black shadow-xl dark:bg-zinc-950 dark:text-zinc-50">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Receipt</h2>
            <button
              type="button"
              className="text-sm opacity-70 hover:opacity-100"
              onClick={onClose}
            >
              Close
            </button>
          </div>
          <div className="rounded-lg border border-zinc-200 bg-white p-3 text-black dark:border-zinc-700">
            <ReceiptBody
              business={business}
              receipt={receipt}
              currency={currency}
              addressLine={addressLine}
              forceBlack
            />
          </div>
          <div className="mt-4 flex gap-2">
            <Button className="flex-1" onClick={() => window.print()}>
              Print receipt
            </Button>
            <Button variant="outline" className="flex-1" onClick={onClose}>
              Done
            </Button>
          </div>
        </div>
      </div>

      {/* Print-only copy — always black on white */}
      <div className="pos-receipt-print hidden print:block">
        <ReceiptBody
          business={business}
          receipt={receipt}
          currency={currency}
          addressLine={addressLine}
          forceBlack
        />
      </div>
    </>
  );
}

function ReceiptBody({
  business,
  receipt,
  currency,
  addressLine,
  forceBlack,
}: {
  business: ReceiptBusiness;
  receipt: ReceiptData;
  currency: string;
  addressLine: string;
  forceBlack?: boolean;
}) {
  const ink = forceBlack ? { color: "#000" as const } : undefined;
  const lines = receipt.lines?.length ? receipt.lines : [];

  return (
    <div className="space-y-3 text-sm" style={ink}>
      <div className="text-center">
        {business.logo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={business.logo}
            alt={business.name}
            className="mx-auto mb-2 h-14 w-auto object-contain"
          />
        ) : null}
        <p className="text-base font-bold" style={ink}>
          {business.name}
        </p>
        {business.legalName && business.legalName !== business.name ? (
          <p className="text-xs" style={ink}>
            {business.legalName}
          </p>
        ) : null}
        {addressLine ? (
          <p className="text-xs" style={ink}>
            {addressLine}
          </p>
        ) : null}
        {business.phone ? (
          <p className="text-xs" style={ink}>
            Tel: {business.phone}
          </p>
        ) : null}
        {business.email ? (
          <p className="text-xs" style={ink}>
            {business.email}
          </p>
        ) : null}
        {business.kraPin ? (
          <p className="text-xs" style={ink}>
            PIN: {business.kraPin}
          </p>
        ) : null}
        {business.registrationNumber ? (
          <p className="text-xs" style={ink}>
            Reg: {business.registrationNumber}
          </p>
        ) : null}
      </div>

      <div
        className="border-y border-dashed py-2 text-xs"
        style={{ ...ink, borderColor: "#000" }}
      >
        <div className="flex justify-between gap-2">
          <span>Receipt</span>
          <span className="font-mono font-semibold">{receipt.invoiceNumber}</span>
        </div>
        <div className="flex justify-between gap-2">
          <span>Date</span>
          <span>{receipt.soldAt}</span>
        </div>
        {receipt.cashierName ? (
          <div className="flex justify-between gap-2">
            <span>Cashier</span>
            <span>{receipt.cashierName}</span>
          </div>
        ) : null}
        <div className="flex justify-between gap-2">
          <span>Type</span>
          <span>{receipt.isCredit ? "CREDIT INVOICE" : "CASH SALE"}</span>
        </div>
        <div className="flex justify-between gap-2">
          <span>Payment</span>
          <span>{receipt.paymentMethod}</span>
        </div>
        {receipt.customerName ? (
          <div className="flex justify-between gap-2">
            <span>Customer</span>
            <span>{receipt.customerName}</span>
          </div>
        ) : null}
        {receipt.customerPhone ? (
          <div className="flex justify-between gap-2">
            <span>Phone</span>
            <span>{receipt.customerPhone}</span>
          </div>
        ) : null}
      </div>

      <table className="w-full text-xs" style={ink}>
        <thead>
          <tr style={{ borderBottom: "1px solid #000" }}>
            <th className="py-1 text-left font-semibold">Item</th>
            <th className="py-1 text-right font-semibold">Qty</th>
            <th className="py-1 text-right font-semibold">Price</th>
            <th className="py-1 text-right font-semibold">Amt</th>
          </tr>
        </thead>
        <tbody>
          {lines.length === 0 ? (
            <tr>
              <td colSpan={4} className="py-2 text-center">
                No line items
              </td>
            </tr>
          ) : (
            lines.map((l, i) => (
              <tr
                key={i}
                style={{ borderBottom: "1px dashed #333" }}
              >
                <td className="py-1 pr-1" style={ink}>
                  {l.name || "Item"}
                  {l.unitLabel ? (
                    <span className="block text-[10px]">({l.unitLabel})</span>
                  ) : null}
                </td>
                <td className="py-1 text-right tabular-nums" style={ink}>
                  {Number(l.quantity)}
                </td>
                <td className="py-1 text-right tabular-nums" style={ink}>
                  {Number(l.unitPrice).toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </td>
                <td className="py-1 text-right tabular-nums" style={ink}>
                  {Number(l.total).toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      <div className="space-y-1 text-xs" style={ink}>
        <div className="flex justify-between">
          <span>Subtotal</span>
          <span className="tabular-nums">
            {money(receipt.subtotal, currency)}
          </span>
        </div>
        <div className="flex justify-between text-sm font-bold">
          <span>TOTAL</span>
          <span className="tabular-nums">{money(receipt.total, currency)}</span>
        </div>
        {receipt.isCredit ? (
          <>
            <div className="flex justify-between">
              <span>Paid</span>
              <span className="tabular-nums">
                {money(receipt.amountPaid, currency)}
              </span>
            </div>
            <div className="flex justify-between font-semibold">
              <span>Balance due</span>
              <span className="tabular-nums">
                {money(receipt.balanceDue, currency)}
              </span>
            </div>
          </>
        ) : (
          <div className="flex justify-between">
            <span>Amount paid</span>
            <span className="tabular-nums">
              {money(receipt.amountPaid || receipt.total, currency)}
            </span>
          </div>
        )}
      </div>

      {receipt.notes ? (
        <p className="text-[10px]" style={ink}>
          {receipt.notes}
        </p>
      ) : null}

      <p
        className="border-t border-dashed pt-2 text-center text-[10px]"
        style={{ ...ink, borderColor: "#000" }}
      >
        Thank you for your business
      </p>
    </div>
  );
}
