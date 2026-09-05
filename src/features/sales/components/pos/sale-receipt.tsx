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
  /** Company contact person (B2B credit). */
  contactName?: string | null;
  customerPhone?: string | null;
  paymentMethod: string;
  isCredit: boolean;
  amountPaid: number;
  balanceDue: number;
  amountTendered?: number | null;
  changeDue?: number | null;
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

const SHEET_CSS = `
.pos-receipt-sheet,
.pos-receipt-sheet * {
  color: #000 !important;
  background-color: transparent !important;
  border-color: #000 !important;
  -webkit-text-fill-color: #000 !important;
  opacity: 1 !important;
}
.pos-receipt-sheet {
  background-color: #fff !important;
  color: #000 !important;
}
.pos-receipt-sheet img {
  opacity: 1 !important;
  filter: none !important;
}
@media print {
  @page { margin: 4mm; size: 80mm auto; }
  html, body {
    background: #fff !important;
    color: #000 !important;
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }
  body * { visibility: hidden !important; }
  .pos-receipt-print-root,
  .pos-receipt-print-root * {
    visibility: visible !important;
  }
  .pos-receipt-print-root {
    position: absolute;
    left: 0;
    top: 0;
    width: 80mm;
    max-width: 100%;
    padding: 2mm 4mm;
    background: #fff !important;
    color: #000 !important;
    font-size: 11px;
    line-height: 1.35;
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  }
  .no-print { display: none !important; }
}
`;

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
      <style dangerouslySetInnerHTML={{ __html: SHEET_CSS }} />

      {/* On-screen: always light sheet, ignores app dark mode */}
      <div
        className="no-print fixed inset-0 z-[100] flex items-center justify-center p-4"
        style={{ backgroundColor: "rgba(0,0,0,0.55)" }}
      >
        <div
          className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-xl p-4 shadow-xl"
          style={{
            backgroundColor: "#ffffff",
            color: "#000000",
            colorScheme: "light",
          }}
        >
          <div
            className="mb-3 flex items-center justify-between"
            style={{ color: "#000000" }}
          >
            <h2 style={{ fontSize: "1.125rem", fontWeight: 600, color: "#000" }}>
              Receipt
            </h2>
            <button
              type="button"
              onClick={onClose}
              style={{
                fontSize: "0.875rem",
                color: "#333",
                background: "none",
                border: "none",
                cursor: "pointer",
              }}
            >
              Close
            </button>
          </div>

          <div
            className="pos-receipt-sheet rounded-lg border p-3"
            style={{
              backgroundColor: "#ffffff",
              color: "#000000",
              borderColor: "#cccccc",
            }}
          >
            <ReceiptBody
              business={business}
              receipt={receipt}
              currency={currency}
              addressLine={addressLine}
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

      {/* Print-only copy */}
      <div className="pos-receipt-print-root hidden print:block">
        <div className="pos-receipt-sheet">
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
  const lines = receipt.lines?.length ? receipt.lines : [];
  const displayName =
    (business.legalName && business.legalName.trim()) || business.name;
  const black: React.CSSProperties = { color: "#000000" };

  return (
    <div style={{ ...black, fontSize: "0.875rem" }}>
      <div style={{ textAlign: "center", ...black }}>
        {business.logo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={business.logo}
            alt={displayName}
            style={{
              margin: "0 auto 8px",
              height: 56,
              width: "auto",
              objectFit: "contain",
              display: "block",
            }}
          />
        ) : null}
        <p style={{ ...black, fontSize: "1rem", fontWeight: 700, margin: 0 }}>
          {displayName}
        </p>
        {addressLine ? (
          <p style={{ ...black, fontSize: "0.75rem", margin: "2px 0" }}>
            {addressLine}
          </p>
        ) : null}
        {business.phone ? (
          <p style={{ ...black, fontSize: "0.75rem", margin: "2px 0" }}>
            Tel: {business.phone}
          </p>
        ) : null}
        {business.email ? (
          <p style={{ ...black, fontSize: "0.75rem", margin: "2px 0" }}>
            {business.email}
          </p>
        ) : null}
        {business.kraPin ? (
          <p style={{ ...black, fontSize: "0.75rem", margin: "2px 0" }}>
            PIN: {business.kraPin}
          </p>
        ) : null}
      </div>

      <div
        style={{
          ...black,
          borderTop: "1px dashed #000",
          borderBottom: "1px dashed #000",
          padding: "8px 0",
          marginTop: 12,
          fontSize: "0.75rem",
        }}
      >
        <Row label="Receipt" value={receipt.invoiceNumber} bold />
        <Row label="Date" value={receipt.soldAt} />
        {receipt.cashierName ? (
          <Row label="Cashier" value={receipt.cashierName} />
        ) : null}
        <Row
          label="Type"
          value={receipt.isCredit ? "CREDIT INVOICE" : "CASH SALE"}
        />
        <Row label="Payment" value={receipt.paymentMethod} />
        {receipt.customerName ? (
          <Row label="Customer" value={receipt.customerName} />
        ) : null}
        {receipt.contactName ? (
          <Row label="Contact" value={receipt.contactName} />
        ) : null}
        {receipt.customerPhone ? (
          <Row label="Phone" value={receipt.customerPhone} />
        ) : null}
      </div>

      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          marginTop: 12,
          fontSize: "0.75rem",
          color: "#000",
        }}
      >
        <thead>
          <tr>
            <th style={thStyle("left")}>Item</th>
            <th style={thStyle("right")}>Qty</th>
            <th style={thStyle("right")}>Price</th>
            <th style={thStyle("right")}>Amt</th>
          </tr>
        </thead>
        <tbody>
          {lines.length === 0 ? (
            <tr>
              <td colSpan={4} style={{ ...black, textAlign: "center", padding: 8 }}>
                No line items
              </td>
            </tr>
          ) : (
            lines.map((l, i) => (
              <tr key={i} style={{ borderBottom: "1px dashed #333" }}>
                <td style={{ ...black, padding: "4px 4px 4px 0", textAlign: "left" }}>
                  {l.name || "Item"}
                  {l.unitLabel ? (
                    <span style={{ display: "block", fontSize: 10, color: "#000" }}>
                      ({l.unitLabel})
                    </span>
                  ) : null}
                </td>
                <td style={{ ...black, padding: 4, textAlign: "right" }}>
                  {Number(l.quantity)}
                </td>
                <td style={{ ...black, padding: 4, textAlign: "right" }}>
                  {Number(l.unitPrice).toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </td>
                <td style={{ ...black, padding: 4, textAlign: "right" }}>
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

      <div style={{ ...black, marginTop: 12, fontSize: "0.75rem" }}>
        <Row label="Subtotal" value={money(receipt.subtotal, currency)} />
        <Row label="TOTAL" value={money(receipt.total, currency)} bold />
        {receipt.isCredit ? (
          <>
            <Row label="Paid" value={money(receipt.amountPaid, currency)} />
            <Row
              label="Balance due"
              value={money(receipt.balanceDue, currency)}
              bold
            />
          </>
        ) : (
          <>
            <Row
              label="Amount tendered"
              value={money(
                receipt.amountTendered != null && receipt.amountTendered > 0
                  ? receipt.amountTendered
                  : receipt.amountPaid || receipt.total,
                currency,
              )}
            />
            <Row
              label="Amount paid"
              value={money(receipt.amountPaid || receipt.total, currency)}
            />
            {(receipt.changeDue != null && receipt.changeDue > 0) ||
            (receipt.amountTendered != null &&
              receipt.amountTendered > (receipt.total || 0)) ? (
              <Row
                label="Change"
                value={money(
                  receipt.changeDue != null && receipt.changeDue > 0
                    ? receipt.changeDue
                    : Math.max(
                        0,
                        Number(receipt.amountTendered || 0) -
                          Number(receipt.total || 0),
                      ),
                  currency,
                )}
                bold
              />
            ) : null}
          </>
        )}
      </div>

      {receipt.notes ? (
        <p style={{ ...black, fontSize: 10, marginTop: 8 }}>{receipt.notes}</p>
      ) : null}

      <p
        style={{
          ...black,
          borderTop: "1px dashed #000",
          marginTop: 12,
          paddingTop: 8,
          textAlign: "center",
          fontSize: 10,
        }}
      >
        Thank you for your business
      </p>
    </div>
  );
}

function Row({
  label,
  value,
  bold,
}: {
  label: string;
  value: string;
  bold?: boolean;
}) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        gap: 8,
        color: "#000000",
        fontWeight: bold ? 700 : 400,
        marginBottom: 2,
      }}
    >
      <span style={{ color: "#000000" }}>{label}</span>
      <span style={{ color: "#000000", fontVariantNumeric: "tabular-nums" }}>
        {value}
      </span>
    </div>
  );
}

function thStyle(align: "left" | "right"): React.CSSProperties {
  return {
    color: "#000000",
    fontWeight: 600,
    textAlign: align,
    padding: "4px 0",
    borderBottom: "1px solid #000",
  };
}
