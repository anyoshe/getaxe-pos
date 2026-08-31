/**
 * Maps catalogue capabilities to runtime status and UI surfaces.
 * - wired: enabling changes real app behaviour (wizard, stock, POS, finance, …)
 * - partial: core path exists; advanced edges still roadmap
 * - roadmap: catalogue only — no dedicated feature path yet
 */
export type CapabilityWiringStatus = "wired" | "partial" | "roadmap";

export type CapabilityWiring = {
  status: CapabilityWiringStatus;
  /** Deep links when the feature has a screen */
  routes?: string[];
  note?: string;
};

export const CAPABILITY_WIRING: Record<string, CapabilityWiring> = {
  // Core
  "core.attachments": { status: "partial", note: "Schema-ready; attach UI limited" },
  "core.audit-log": {
    status: "wired",
    routes: ["/settings/audit-log", "/reports/audit"],
  },

  // Inventory — product / stock core
  "inventory.product-types": { status: "wired", routes: ["/inventory/products"] },
  "inventory.sku": { status: "wired", routes: ["/inventory/products"], note: "Product wizard field" },
  "inventory.auto-sku": { status: "partial", note: "Manual SKU; auto-generate limited" },
  "inventory.barcode": { status: "wired", routes: ["/inventory/products", "/sales/pos"] },
  "inventory.multiple-barcodes": { status: "roadmap" },
  "inventory.qr-code": { status: "partial", routes: ["/sales/pos"], note: "Scan path supports codes" },
  "inventory.serial-numbers": {
    status: "wired",
    routes: ["/inventory/products", "/inventory/stock/receive", "/sales/pos"],
  },
  "inventory.batch-control": {
    status: "wired",
    routes: ["/inventory/batches", "/inventory/stock/receive", "/purchases/receiving"],
  },
  "inventory.expiry-control": {
    status: "wired",
    routes: ["/inventory/batches", "/inventory/stock/receive"],
  },
  "inventory.manufacturing-date": {
    status: "wired",
    routes: ["/inventory/stock/receive", "/purchases/receiving"],
  },
  "inventory.shelf-life": { status: "partial", routes: ["/inventory/batches"] },
  "inventory.expiry-alerts": { status: "partial", routes: ["/dashboard", "/reports/inventory"] },
  "inventory.multi-unit": {
    status: "wired",
    routes: ["/inventory/products", "/inventory/stock/receive", "/sales/pos"],
  },
  "inventory.multi-uom": {
    status: "wired",
    routes: ["/inventory/products", "/settings/units"],
  },
  "inventory.unit-conversion": {
    status: "wired",
    routes: ["/inventory/products", "/sales/pos", "/purchases/orders"],
  },
  "inventory.purchase-unit": { status: "wired", routes: ["/inventory/products"] },
  "inventory.sales-unit": { status: "wired", routes: ["/inventory/products", "/sales/pos"] },
  "inventory.stock-unit": { status: "wired", routes: ["/inventory/products"] },
  "inventory.cost-price": { status: "wired", routes: ["/inventory/products", "/inventory/product-prices"] },
  "inventory.selling-price": {
    status: "wired",
    routes: ["/inventory/products", "/inventory/product-prices", "/sales/pos"],
  },
  "inventory.multiple-price-lists": {
    status: "wired",
    routes: ["/inventory/price-lists", "/inventory/product-prices"],
  },
  "inventory.customer-specific-pricing": { status: "roadmap" },
  "inventory.promotional-pricing": {
    status: "wired",
    routes: ["/inventory/promotions", "/sales/pos"],
    note: "POS applies best active promo automatically",
  },
  "inventory.margin-control": { status: "roadmap" },
  "inventory.brands": { status: "wired", routes: ["/inventory/products"], note: "Brand field on product" },
  "inventory.manufacturers": {
    status: "wired",
    routes: ["/inventory/manufacturers", "/inventory/products"],
  },
  "inventory.product-attributes": { status: "roadmap" },
  "inventory.product-variants": { status: "roadmap" },
  "inventory.reorder-level": { status: "wired", routes: ["/inventory/products"] },
  "inventory.minimum-stock": { status: "wired", routes: ["/inventory/products"] },
  "inventory.maximum-stock": { status: "partial", routes: ["/inventory/products"] },
  "inventory.safety-stock": { status: "roadmap" },
  "inventory.negative-stock": {
    status: "wired",
    routes: ["/inventory/products"],
    note: "Allow negative on product + stock rules",
  },
  "inventory.stock-adjustment": {
    status: "wired",
    routes: ["/inventory/adjustments"],
  },
  "inventory.stock-transfers": {
    status: "wired",
    routes: ["/inventory/transfers"],
  },
  "inventory.multi-warehouse": {
    status: "wired",
    routes: ["/settings/warehouses", "/inventory/stock"],
  },
  "inventory.bin-locations": {
    status: "partial",
    routes: ["/settings/warehouse-locations"],
  },
  "inventory.shelf-locations": {
    status: "partial",
    routes: ["/settings/warehouse-locations"],
  },
  "inventory.available-stock": { status: "wired", routes: ["/inventory/stock", "/sales/pos"] },
  "inventory.reserved-stock": { status: "roadmap" },
  "inventory.in-transit-stock": { status: "partial", routes: ["/inventory/transfers"] },
  "inventory.stock-status": { status: "partial", routes: ["/inventory/stock"] },
  "inventory.stock-freeze": { status: "roadmap" },
  "inventory.damaged-stock": { status: "roadmap" },
  "inventory.quarantine-stock": { status: "roadmap" },
  "inventory.consignment-stock": { status: "roadmap" },
  "inventory.controlled-items": { status: "partial", note: "Pharmacy controlled path partial" },
  "inventory.cycle-count": {
    status: "wired",
    routes: ["/inventory/cycle-counts"],
    note: "Stock take sessions; posts variances as adjustments",
  },
  "inventory.dead-stock": { status: "partial", routes: ["/reports/inventory"] },
  "inventory.stock-aging": { status: "partial", routes: ["/reports/inventory"] },
  "inventory.moving-analysis": { status: "partial", routes: ["/reports/inventory"] },
  "inventory.turnover-analysis": { status: "partial", routes: ["/reports/inventory"] },
  "inventory.valuation": { status: "partial", routes: ["/reports/inventory"] },
  "inventory.abc-classification": { status: "roadmap" },
  "inventory.demand-forecasting": { status: "roadmap" },
  "inventory.packing": { status: "roadmap" },
  "inventory.picking": { status: "roadmap" },
  "inventory.quality-checks": { status: "roadmap" },
  "inventory.traceability": {
    status: "partial",
    routes: ["/inventory/batches", "/inventory/stock-movements"],
  },
  "inventory.recall-management": { status: "roadmap" },

  // Pharmacy
  "pharmacy.core": {
    status: "wired",
    routes: ["/inventory/pharmacy-catalogues", "/inventory/products"],
  },
  "pharmacy.medicine-catalogue": {
    status: "wired",
    routes: ["/inventory/pharmacy-catalogues", "/inventory/products"],
  },
  "pharmacy.dosage-forms": {
    status: "wired",
    routes: ["/inventory/pharmacy-catalogues"],
  },
  "pharmacy.drug-categories": {
    status: "wired",
    routes: ["/inventory/pharmacy-catalogues"],
  },
  "pharmacy.medicine-strength": {
    status: "wired",
    routes: ["/inventory/pharmacy-catalogues"],
  },
  "pharmacy.prescription-types": {
    status: "wired",
    routes: ["/inventory/pharmacy-catalogues"],
  },
  "pharmacy.generic-brand-medicines": {
    status: "wired",
    routes: ["/inventory/products"],
    note: "Generic name + brand on medicine products",
  },
  "pharmacy.active-ingredients": { status: "roadmap" },
  "pharmacy.administration-routes": { status: "roadmap" },
  "pharmacy.dosage-instructions": { status: "roadmap" },
  "pharmacy.dispensing": {
    status: "wired",
    routes: ["/pharmacy/dispensing"],
    note: "Walk-in dispense with FEFO batches; stock via inventory issue",
  },
  "pharmacy.controlled-medicines": { status: "partial" },
  "pharmacy.cold-chain-monitoring": { status: "roadmap" },
  "pharmacy.medicine-recall": { status: "roadmap" },
  "pharmacy.audit-trail": {
    status: "partial",
    routes: ["/settings/audit-log"],
  },

  // Sales
  "sales.pos": { status: "wired", routes: ["/sales/pos"] },
  "sales.invoices": { status: "wired", routes: ["/sales/invoices"] },
  "sales.orders": { status: "wired", routes: ["/sales/orders"] },
  "sales.quotations": { status: "wired", routes: ["/sales/quotations"] },
  "sales.quotation-conversion": { status: "wired", routes: ["/sales/quotations"] },
  "sales.customer-returns": { status: "wired", routes: ["/sales/returns"] },
  "sales.return-to-stock": { status: "wired", routes: ["/sales/returns"] },
  "sales.return-approval": { status: "partial", routes: ["/sales/returns"] },
  "sales.exchange": { status: "roadmap" },
  "sales.refund-processing": { status: "wired", routes: ["/sales/returns"] },
  "sales.discounts": { status: "partial", routes: ["/sales/pos"] },
  "sales.loyalty-program": {
    status: "wired",
    routes: ["/customers/loyalty", "/sales/pos"],
  },
  "sales.customer-deposits": { status: "roadmap" },
  "sales.payment-refunds": { status: "partial", routes: ["/finance/payments"] },
  "sales.payment-reconciliation": {
    status: "wired",
    routes: ["/finance/reconciliation"],
  },
  "sales.delivery-management": { status: "roadmap" },

  // Purchasing
  "purchasing.purchase-orders": { status: "wired", routes: ["/purchases/orders"] },
  "purchasing.goods-receiving": { status: "wired", routes: ["/purchases/receiving"] },
  "purchasing.supplier-returns": { status: "wired", routes: ["/purchases/returns"] },
  "purchasing.supplier-invoices": {
    status: "wired",
    routes: ["/purchases/supplier-invoices"],
  },

  // Finance
  "finance.cash-accounts": { status: "wired", routes: ["/finance/cash-accounts"] },
  "finance.chart-of-accounts": { status: "wired", routes: ["/finance/accounts"] },
  "finance.journal-entries": { status: "wired", routes: ["/finance/journals"] },
  "finance.expense-management": { status: "wired", routes: ["/finance/expenses"] },
  "finance.expense-categories": { status: "partial", routes: ["/finance/expenses"] },
  "finance.expense-approval": { status: "roadmap" },
  "finance.income-management": { status: "wired", routes: ["/finance/incomes"] },
  "finance.tax-rates": { status: "wired", routes: ["/finance/tax-rates"] },
  "finance.tax-inclusive-pricing": { status: "partial", routes: ["/finance/tax-rates", "/sales/pos"] },
  "finance.vat-management": { status: "partial", routes: ["/finance/tax-rates", "/reports/finance"] },
  "finance.withholding-tax": { status: "roadmap" },
  "finance.payment-reconciliation": {
    status: "wired",
    routes: ["/finance/reconciliation"],
  },
  "finance.cash-transfers": { status: "partial", routes: ["/finance/cash-accounts"] },
  "finance.accounting-periods": { status: "roadmap" },
  "finance.opening-balances": { status: "partial" },
  "finance.dashboard": { status: "wired", routes: ["/dashboard", "/reports/finance"] },
  "finance.profit-loss": { status: "wired", routes: ["/reports/finance"] },
  "finance.balance-sheet": { status: "partial", routes: ["/reports/finance"] },
  "finance.trial-balance": { status: "partial", routes: ["/reports/finance"] },
  "finance.cash-flow": { status: "partial", routes: ["/reports/finance"] },

  // Reporting
  "reporting.core": { status: "wired", routes: ["/reports"] },
  "reporting.sales": { status: "wired", routes: ["/reports/sales"] },
  "reporting.inventory": { status: "wired", routes: ["/reports/inventory"] },
  "reporting.finance": { status: "wired", routes: ["/reports/finance"] },
  "reporting.export": { status: "wired", routes: ["/reports"] },
  "reporting.dashboard": { status: "wired", routes: ["/dashboard"] },
  "reporting.scheduled": { status: "roadmap" },
  "reporting.bi": { status: "roadmap" },
  "reporting.audit": { status: "wired", routes: ["/reports/audit"] },

  // Industry packs (profile markers)
  "industry.agrovet": { status: "partial", note: "Profile enables related inventory/pharmacy caps" },
  "industry.apparel": { status: "partial" },
  "industry.automotive": { status: "partial" },
  "industry.hospitality": { status: "partial" },
  "industry.manufacturing-light": { status: "partial" },
  "industry.optical": { status: "partial" },
  "industry.services": { status: "partial" },
};

export function getCapabilityWiring(id: string): CapabilityWiring {
  return (
    CAPABILITY_WIRING[id] ?? {
      status: "roadmap",
      note: "Catalogue entry — no dedicated UI wired yet",
    }
  );
}
