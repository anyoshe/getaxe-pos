import { escapeHtmlText } from "@/lib/print-document";

type Biz = {
  name: string;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  logo?: string | null;
};

function header(biz: Biz, title: string, meta: string) {
  const logo = biz.logo
    ? `<img class="logo" src="${escapeHtmlText(biz.logo)}" alt="Logo" />`
    : "";
  return `
  <div class="row">
    <div class="box">
      ${logo}
      <h1>${escapeHtmlText(biz.name)}</h1>
      <div class="muted">
        ${biz.address ? escapeHtmlText(biz.address) + "<br/>" : ""}
        ${biz.phone ? "Tel: " + escapeHtmlText(biz.phone) + "<br/>" : ""}
        ${biz.email ? escapeHtmlText(biz.email) : ""}
      </div>
    </div>
    <div class="box" style="text-align:right">
      <h2>${escapeHtmlText(title)}</h2>
      <div>${meta}</div>
    </div>
  </div>`;
}

export function buildPurchaseOrderHtml(data: {
  documentTitle: string;
  orderNumber: string;
  status: string;
  orderedAt: string;
  notes?: string | null;
  supplier: {
    name: string;
    phone?: string | null;
    email?: string | null;
    address?: string | null;
  };
  business: Biz;
  lines: Array<{
    sku: string;
    name: string;
    quantity: number;
    unitCost: number;
    lineTotal: number;
  }>;
  subtotal: number;
  tax: number;
  total: number;
}) {
  const rows = data.lines
    .map(
      (l, i) => `
    <tr>
      <td>${i + 1}</td>
      <td>${escapeHtmlText(l.sku)}</td>
      <td>${escapeHtmlText(l.name)}</td>
      <td class="num">${l.quantity}</td>
      <td class="num">${l.unitCost.toFixed(2)}</td>
      <td class="num">${l.lineTotal.toFixed(2)}</td>
    </tr>`,
    )
    .join("");

  return `
  ${header(
    data.business,
    data.documentTitle,
    `<strong>${escapeHtmlText(data.orderNumber)}</strong><br/>
     Status: ${escapeHtmlText(data.status)}<br/>
     Date: ${escapeHtmlText(data.orderedAt)}`,
  )}
  <div class="row">
    <div class="box">
      <strong>Supplier</strong><br/>
      ${escapeHtmlText(data.supplier.name)}<br/>
      ${data.supplier.address ? escapeHtmlText(data.supplier.address) + "<br/>" : ""}
      ${data.supplier.phone ? "Tel: " + escapeHtmlText(data.supplier.phone) + "<br/>" : ""}
      ${data.supplier.email ? escapeHtmlText(data.supplier.email) : ""}
    </div>
  </div>
  <table>
    <thead>
      <tr>
        <th>#</th>
        <th>SKU</th>
        <th>Description</th>
        <th class="num">Qty</th>
        <th class="num">Unit cost</th>
        <th class="num">Line total</th>
      </tr>
    </thead>
    <tbody>${rows || `<tr><td colspan="6">No lines</td></tr>`}</tbody>
  </table>
  <div class="totals">
    <div>Subtotal: ${data.subtotal.toFixed(2)}</div>
    ${data.tax ? `<div>Tax: ${data.tax.toFixed(2)}</div>` : ""}
    <strong>Total: ${data.total.toFixed(2)}</strong>
  </div>
  ${
    data.notes
      ? `<p><strong>Notes:</strong> ${escapeHtmlText(data.notes)}</p>`
      : ""
  }
  <div class="footer">
    Please supply the items above as ordered. Generated from GetAxe POS.
  </div>`;
}

export function buildGoodsReceiptHtml(data: {
  documentTitle: string;
  receiptNumber: string;
  receivedAt: string;
  supplierName: string;
  notes?: string | null;
  business: Biz;
  lines: Array<{
    sku: string;
    name: string;
    quantity: number;
    unitCost: number;
    lineTotal: number;
  }>;
  total: number;
}) {
  const rows = data.lines
    .map(
      (l, i) => `
    <tr>
      <td>${i + 1}</td>
      <td>${escapeHtmlText(l.sku)}</td>
      <td>${escapeHtmlText(l.name)}</td>
      <td class="num">${l.quantity}</td>
      <td class="num">${l.unitCost.toFixed(2)}</td>
      <td class="num">${l.lineTotal.toFixed(2)}</td>
    </tr>`,
    )
    .join("");

  return `
  ${header(
    data.business,
    data.documentTitle,
    `<strong>${escapeHtmlText(data.receiptNumber)}</strong><br/>
     Received: ${escapeHtmlText(data.receivedAt)}`,
  )}
  <p><strong>Supplier:</strong> ${escapeHtmlText(data.supplierName)}</p>
  <table>
    <thead>
      <tr>
        <th>#</th><th>SKU</th><th>Description</th>
        <th class="num">Qty</th><th class="num">Cost</th><th class="num">Total</th>
      </tr>
    </thead>
    <tbody>${rows || `<tr><td colspan="6">No lines</td></tr>`}</tbody>
  </table>
  <div class="totals"><strong>Total: ${data.total.toFixed(2)}</strong></div>
  ${
    data.notes
      ? `<p><strong>Notes:</strong> ${escapeHtmlText(data.notes)}</p>`
      : ""
  }
  <div class="footer">Goods received note — GetAxe POS</div>`;
}

export function buildSupplierInvoiceHtml(data: {
  documentTitle: string;
  invoiceNumber: string;
  invoiceDate: string;
  dueDate?: string | null;
  status: string;
  total: number;
  amountPaid: number;
  balanceDue: number;
  notes?: string | null;
  business: Biz;
}) {
  return `
  ${header(
    data.business,
    data.documentTitle,
    `<strong>${escapeHtmlText(data.invoiceNumber)}</strong><br/>
     Date: ${escapeHtmlText(data.invoiceDate)}<br/>
     ${data.dueDate ? "Due: " + escapeHtmlText(data.dueDate) + "<br/>" : ""}
     Status: ${escapeHtmlText(data.status)}`,
  )}
  <table>
    <tbody>
      <tr><td>Total</td><td class="num">${data.total.toFixed(2)}</td></tr>
      <tr><td>Paid</td><td class="num">${data.amountPaid.toFixed(2)}</td></tr>
      <tr><td><strong>Balance due</strong></td><td class="num"><strong>${data.balanceDue.toFixed(2)}</strong></td></tr>
    </tbody>
  </table>
  ${
    data.notes
      ? `<p><strong>Notes:</strong> ${escapeHtmlText(data.notes)}</p>`
      : ""
  }
  <div class="footer">Accounts payable document — GetAxe POS</div>`;
}
