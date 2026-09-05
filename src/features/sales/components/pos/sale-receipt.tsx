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
  return `${currency} ${n.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function SaleReceipt({
  business,
  receipt,
  open,
  onClose,
  autoPrint = true,
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
      const t = setTimeout(() => {
        window.print();
      }, 400);
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
      {/* Screen overlay */}
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 print:hidden">
        <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-xl bg-card p-4 shadow-xl">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Receipt</h2>
            <button
              type="button"
              className="text-sm text-muted-foreground hover:text-foreground"
              onClick={onClose}
            >
              Close
            </button>
          </div>
          <ReceiptBody
            business={business}
            receipt={receipt}
            currency={currency}
            addressLine={addressLine}
          />
          <div className="mt-4 flex gap-2">
            <Button className="flex-1" onClick={() => window.print()}>
              Print receipt
            </Button>
            <Button variant="outline" className="flex-1" onClick={onClose}>
              New sale
            </Button>
          </div>
        </div>
      </div>

      {/* Print-only thermal-style sheet */}
      <div className="hidden print:block">
        <style
          dangerouslySetInnerHTML={{
            __html: `
          @media print {
            body * { visibility: hidden !important; }
            .pos-receipt-print, .pos-receipt-print * { visibility: visible !important; }
            .pos-receipt-print {
              position: absolute; left: 0; top: 0; width: 80mm; max-width: 100%;
              padding: 4mm; font-size: 12px; color: #000; background: #fff;
            }
          }`,
          }}
        />
        <div className="pos-receipt-print">
          <ReceiptBody
            business={business}
            receipt={receipt}
            currency={currency}
            addressLine={addressLine}
          />
        </div>
      </div>
    </>
  );
}

function ReceiptBody({
  business,
  receipt,
  currency,
  addressLine,
}: {
  business: ReceiptBusiness;
  receipt: ReceiptData;
  currency: string;
  addressLine: string;
}) {
  return (
    <div className="space-y-3 text-sm text-foreground print:text-black">
      <div className="text-center">
        {business.logo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={business.logo}
            alt={business.name}
            className="mx-auto mb-2 h-14 w-auto object-contain"
          />
        ) : null}
        <p className="text-base font-bold">{business.name}</p>
        {business.legalName && business.legalName !== business.name ? (
          <p className="text-xs text-muted-foreground print:text-black">
            {business.legalName}
          </p>
        ) : null}
        {addressLine ? <p className="text-xs">{addressLine}</p> : null}
        {business.phone ? <p className="text-xs">Tel: {business.phone}</p> : null}
        {business.email ? <p className="text-xs">{business.email}</p> : null}
        {business.kraPin ? (
          <p className="text-xs">PIN: {business.kraPin}</p>
        ) : null}
        {business.registrationNumber ? (
          <p className="text-xs">Reg: {business.registrationNumber}</p>
        ) : null}
      </div>

      <div className="border-y border-dashed border-border py-2 text-xs print:border-black">
        <div className="flex justify-between">
          <span>Receipt</span>
          <span className="font-mono font-semibold">{receipt.invoiceNumber}</span>
        </div>
        <div className="flex justify-between">
          <span>Date</span>
          <span>{receipt.soldAt}</span>
        </div>
        {receipt.cashierName ? (
          <div className="flex justify-between">
            <span>Cashier</span>
            <span>{receipt.cashierName}</span>
          </div>
        ) : null}
        <div className="flex justify-between">
          <span>Type</span>
          <span>{receipt.isCredit ? "CREDIT INVOICE" : "CASH SALE"}</span>
        </div>
        <div className="flex justify-between">
          <span>Payment</span>
          <span>{receipt.paymentMethod}</span>
        </div>
        {receipt.customerName ? (
          <div className="flex justify-between">
            <span>Customer</span>
            <span>{receipt.customerName}</span>
          </div>
        ) : null}
        {receipt.customerPhone ? (
          <div className="flex justify-between">
            <span>Phone</span>
            <span>{receipt.customerPhone}</span>
          </div>
        ) : null}
      </div>

      <table className="w-full text-xs">
        <thead>
          <tr className="border-b border-border print:border-black">
            <th className="py-1 text-left font-medium">Item</th>
            <th className="py-1 text-right font-medium">Qty</th>
            <th className="py-1 text-right font-medium">Price</th>
            <th className="py-1 text-right font-medium">Amt</th>
          </tr>
        </thead>
        <tbody>
          {receipt.lines.map((l, i) => (
            <tr key={i} className="border-b border-dashed border-border/60 print:border-black/40">
              <td className="py-1 pr-1">
                {l.name}
                {l.unitLabel ? (
                  <span className="block text-[10px] opacity-70">{l.unitLabel}</span>
                ) : null}
              </td>
              <td className="py-1 text-right tabular-nums">{l.quantity}</td>
              <td className="py-1 text-right tabular-nums">
                {l.unitPrice.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </td>
              <td className="py-1 text-right tabular-nums">
                {l.total.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="space-y-1 text-xs">
        <div className="flex justify-between">
          <span>Subtotal</span>
          <span className="tabular-nums">{money(receipt.subtotal, currency)}</span>
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
        <p className="text-[10px] opacity-80">{receipt.notes}</p>
      ) : null}

      <p className="border-t border-dashed border-border pt-2 text-center text-[10px] print:border-black">
        Thank you for your business
      </p>
    </div>
  );
}
