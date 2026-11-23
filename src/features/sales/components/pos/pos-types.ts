/** Shared POS client types — used by PosClient and split panels. */
import type { ReceiptBusiness } from "./sale-receipt";
import type { PromotionOffer } from "@/features/inventory/services/promotion-price";

export type PosProduct = {
  id: string;
  name: string;
  sku: string | null;
  barcode: string | null;
  categoryId?: string | null;
  categoryName?: string | null;
  productType: string;
  trackInventory: boolean;
  serialized: boolean;
  isControlled?: boolean;
  supplyChannel?: string;
  trackBatch?: boolean;
  trackExpiry?: boolean;
  unitPrice: number;
  retailPrice: number;
  wholesalePrice: number;
  /** Book / average cost per stock unit — used to prevent selling at/below cost */
  costPrice?: number;
  active: boolean;
};

/** productId → warehouseId → qty from inventory_balances (same as Stock on Hand) */
export type StockByProductWarehouse = Record<string, Record<string, number>>;
export type SerialsByProductWarehouse = Record<string, Record<string, string[]>>;
export type PosBatchOption = {
  batchId: string;
  batchNumber: string;
  expiryDate: string | null;
  manufactureDate: string | null;
  quantity: number;
};

export type WarehouseOption = { id: string; name: string; branchId: string };
export type BranchOption = { id: string; name: string };
export type SerialsByProduct = Record<string, string[]>;
export type PriceMode = "retail" | "wholesale";

export type ActivePromotion = PromotionOffer;


export type PosProductUnit = {
  unitId: string;
  factorToStock: number;
  isSalesDefault: boolean;
  isStockUnit: boolean;
  label: string;
  allowSale?: boolean;
  unitCode?: string | null;
  unitName?: string | null;
};

export type CartLine = {
  productId: string;
  name: string;
  sku: string | null;
  quantity: number;
  unitPrice: number;
  unitId: string | null;
  unitLabel: string;
  factorToStock: number;
  serialized: boolean;
  isControlled?: boolean;
  selectedSerials: string[];
  selectedBatchId: string | null;
  trackBatch: boolean;
  trackExpiry: boolean;
};

export type RecentSale = {
  id: string;
  invoiceNumber: string;
  total: number;
  soldAt: string;
};

export interface PosClientProps {
  business?: ReceiptBusiness;
  products: PosProduct[];
  warehouses: WarehouseOption[];
  branches: BranchOption[];
  availableSerials: SerialsByProduct;
  stockByProductWarehouse?: StockByProductWarehouse;
  serialsByProductWarehouse?: SerialsByProductWarehouse;
  productUnitsByProduct?: Record<string, PosProductUnit[]>;
  /** Optional explicit pack prices; else retail/wholesale × factor */
  pricesByProductUnit?: Record<string, Record<string, number>>;
  batchesByProductWarehouse?: Record<string, Record<string, PosBatchOption[]>>;
  /** Active time-bound promotions (inventory.promotional-pricing) */
  activePromotions?: ActivePromotion[];
  fullScreen?: boolean;
  cashierName?: string | null;
  recentSales?: RecentSale[];
  cashAccounts?: Array<{
    id: string;
    name: string;
    type: string;
    bankName?: string | null;
    accountNumber?: string | null;
    branchName?: string | null;
    active?: boolean;
  }>;
  /** off | warn | block — below book cost on a line */
  belowCostSalePolicy?: "off" | "warn" | "block";
  /** Phase A eTIMS mode label for status strip */
  etimsStatusLabel?: string | null;
}

