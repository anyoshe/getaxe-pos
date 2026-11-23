"use client";

import type {
  Dispatch,
  RefObject,
  SetStateAction,
  TransitionStartFunction,
} from "react";
import { toast } from "sonner";

import { createSaleAction } from "../../actions/create-sale";
import {
  ensurePosCustomerAction,
  listPosCustomersAction,
  previewLoyaltyEarnAction,
  type PosCustomerOption,
} from "../../actions/pos-customer";
import {
  newOutboxId,
  offlineInvoiceLabel,
  outboxEnqueue,
  type OutboxSalePayload,
} from "@/lib/offline/outbox";
import type {
  CartLine,
  PosClientProps,
  PosProduct,
  SerialsByProduct,
  StockByProductWarehouse,
} from "./pos-types";
import type { ReceiptData } from "./sale-receipt";

type CashAccount = NonNullable<PosClientProps["cashAccounts"]>[number];

type PosCheckoutOptions = {
  startTransition: TransitionStartFunction;
  refresh: () => void;
  warehouseId: string;
  branchId: string;
  cart: CartLine[];
  total: number;
  notifyMissingSerials: () => boolean;
  saleMode: "CASH" | "CREDIT";
  posCustomers: PosCustomerOption[];
  customerId: string | null;
  openCustomerDialog: (mode?: "select" | "create") => void;
  belowCostSalePolicy: "off" | "warn" | "block";
  sellable: PosProduct[];
  stockOnHand: (productId: string, warehouseId?: string) => number;
  batchesFor: (productId: string) => { quantity: number }[];
  customerPhone: string;
  customerName: string;
  customerLabel: string | null;
  customerContactName: string | null;
  amountTendered: string;
  setCustomerId: (id: string | null) => void;
  setCustomerLabel: (label: string | null) => void;
  setCustomerContactName: (name: string | null) => void;
  setCustomerName: (name: string) => void;
  setCustomerPhone: (phone: string) => void;
  setCustomerPoints: (points: number | null) => void;
  setPosCustomers: Dispatch<SetStateAction<PosCustomerOption[]>>;
  paymentMethod:
    "CASH" | "MPESA" | "CARD" | "BANK_TRANSFER" | "MOBILE_MONEY" | "CREDIT";
  mobileProvider: "MPESA" | "AIRTEL" | "OTHER";
  bankChannel: "TRANSFER" | "DEPOSIT" | "RTGS" | "EFT" | "CHEQUE";
  originBank: string;
  bankAccounts: CashAccount[];
  selectedCashAccountId: string;
  paymentReference: string;
  setPaymentReference: (reference: string) => void;
  setCheckoutOpen: (open: boolean) => void;
  setMobileCartOpen: (open: boolean) => void;
  refreshOutbox: () => Promise<unknown>;
  setStockMap: Dispatch<SetStateAction<StockByProductWarehouse>>;
  setLastReceipt: Dispatch<SetStateAction<ReceiptData | null>>;
  setCart: Dispatch<SetStateAction<CartLine[]>>;
  setAmountTendered: (amount: string) => void;
  setOriginBank: (bank: string) => void;
  scanRef: RefObject<HTMLInputElement | null>;
  setSerialPool: Dispatch<SetStateAction<SerialsByProduct>>;
  cashierName?: string | null;
  estimatedEarn: number;
};

export function createPosCheckoutHandler(options: PosCheckoutOptions) {
  const {
    startTransition,
    refresh,
    warehouseId,
    branchId,
    cart,
    total,
    notifyMissingSerials,
    saleMode,
    posCustomers,
    customerId,
    openCustomerDialog,
    belowCostSalePolicy,
    sellable,
    stockOnHand,
    batchesFor,
    customerPhone,
    customerName,
    customerLabel,
    customerContactName,
    amountTendered,
    setCustomerId,
    setCustomerLabel,
    setCustomerContactName,
    setCustomerName,
    setCustomerPhone,
    setCustomerPoints,
    setPosCustomers,
    paymentMethod,
    mobileProvider,
    bankChannel,
    originBank,
    bankAccounts,
    selectedCashAccountId,
    paymentReference,
    setPaymentReference,
    setCheckoutOpen,
    setMobileCartOpen,
    refreshOutbox,
    setStockMap,
    setLastReceipt,
    setCart,
    setAmountTendered,
    setOriginBank,
    scanRef,
    setSerialPool,
    cashierName,
    estimatedEarn,
  } = options;

  return function checkout() {
    startTransition(async () => {
      if (!warehouseId || !branchId) {
        toast.error("Select warehouse.");
        return;
      }
      if (cart.length === 0) {
        toast.error("Cart is empty.");
        return;
      }
      if (notifyMissingSerials()) return;
      if (saleMode === "CREDIT") {
        const creditCustomer = posCustomers.find(
          (customer) => customer.id === customerId,
        );
        if (!creditCustomer?.allowCredit) {
          toast.error("Select a credit customer before finishing.");
          openCustomerDialog("select");
          return;
        }
      }
      if (belowCostSalePolicy !== "off") {
        for (const line of cart) {
          const prod = sellable.find((x) => x.id === line.productId);
          if (!prod || prod.productType === "service") continue;
          const cost = Number(prod.costPrice ?? 0);
          const factor = line.factorToStock > 0 ? line.factorToStock : 1;
          const costForLineUnit = cost * factor;
          const atOrBelow =
            cost > 0 && line.unitPrice + 1e-9 <= costForLineUnit + 0.009;
          if (!atOrBelow) continue;
          const msg =
            Math.abs(line.unitPrice - costForLineUnit) < 0.009
              ? `${line.name}: price equals cost (${costForLineUnit.toFixed(2)}).`
              : `${line.name}: selling ${line.unitPrice.toFixed(2)} is below cost ${costForLineUnit.toFixed(2)}.`;
          if (belowCostSalePolicy === "block") {
            toast.error(
              `${msg} Update Product prices or set policy to Warn under Settings → Pricing policy.`,
            );
            return;
          }
          toast.warning(`${msg} Completing under warn policy.`);
        }
      }
      for (const line of cart) {
        const prod = sellable.find((x) => x.id === line.productId);
        if (
          prod &&
          prod.productType !== "service" &&
          prod.trackInventory !== false
        ) {
          const factor = line.factorToStock > 0 ? line.factorToStock : 1;
          const need = line.quantity * factor;
          const onHand = stockOnHand(line.productId);
          if (need > onHand + 1e-9) {
            toast.error(
              `${line.name}: need ${need} stock unit(s), only ${onHand} in this warehouse (matches Stock on Hand).`,
            );
            return;
          }
        }
      }
      for (const line of cart) {
        if (
          (line.trackBatch || line.trackExpiry) &&
          batchesFor(line.productId).length > 0 &&
          !line.selectedBatchId
        ) {
          toast.error(
            `${line.name}: select a batch / expiry date before completing the sale.`,
          );
          return;
        }
      }
      for (const line of cart) {
        const prod = sellable.find((x) => x.id === line.productId) as
          { isControlled?: boolean; supplyChannel?: string } | undefined;
        if (prod?.supplyChannel === "programme") {
          toast.error(
            `${line.name} is programme stock (TB/HIV) — not sold on open POS. Use pharmacy dispensation.`,
          );
          return;
        }
        if (prod?.isControlled && !customerId && !customerPhone.trim()) {
          toast.error(
            `${line.name} is controlled — record customer name/phone or select a customer for the register.`,
          );
          return;
        }
      }
      // Credit invoice must be on a registered customer account (AR)
      if (saleMode === "CREDIT") {
        if (!customerId) {
          toast.error(
            "Credit invoice requires a customer account. Look up the customer by phone or register them first.",
          );
          return;
        }
      }

      let resolvedCustomerId = customerId;
      let receiptNote: string | null = null;
      const isOffline = typeof navigator !== "undefined" && !navigator.onLine;

      // Optional: link or create customer when phone was entered (online only)
      if (customerPhone.trim().length >= 7) {
        if (isOffline) {
          receiptNote = customerName.trim()
            ? `Customer: ${customerName.trim()} (${customerPhone.trim()})`
            : `Customer phone: ${customerPhone.trim()}`;
        } else {
          const ensured = await ensurePosCustomerAction({
            phone: customerPhone,
            firstName: customerName.trim() || null,
          });
          if (!ensured.success) {
            toast.error(ensured.message);
            return;
          }
          resolvedCustomerId = ensured.customerId;
          setCustomerId(ensured.customerId);
          setCustomerLabel(ensured.displayName);
          setCustomerContactName(ensured.contactName ?? null);
          if (ensured.created) {
            void listPosCustomersAction().then((r) => {
              if (r.success) setPosCustomers(r.customers);
            });
          }
          receiptNote = `Customer: ${ensured.displayName} (${ensured.phone})`;
        }
      } else if (customerName.trim()) {
        // Name only on receipt — no CRM record without phone
        receiptNote = `Walk-in: ${customerName.trim()}`;
      }

      type PayMethod =
        | "CASH"
        | "MPESA"
        | "CARD"
        | "BANK_TRANSFER"
        | "CHEQUE"
        | "MOBILE_MONEY"
        | "CREDIT";
      let effectiveMethod: PayMethod =
        saleMode === "CREDIT" ? "CREDIT" : paymentMethod;
      if (saleMode !== "CREDIT" && paymentMethod === "MPESA") {
        effectiveMethod = mobileProvider === "MPESA" ? "MPESA" : "MOBILE_MONEY";
      }
      if (saleMode !== "CREDIT" && paymentMethod === "BANK_TRANSFER") {
        effectiveMethod = bankChannel === "CHEQUE" ? "CHEQUE" : "BANK_TRANSFER";
      }
      const paymentDetailParts: string[] = [];
      if (saleMode !== "CREDIT" && paymentMethod === "MPESA") {
        paymentDetailParts.push(`Provider: ${mobileProvider}`);
      }
      if (saleMode !== "CREDIT" && paymentMethod === "BANK_TRANSFER") {
        paymentDetailParts.push(`Channel: ${bankChannel}`);
        if (originBank.trim())
          paymentDetailParts.push(`From: ${originBank.trim()}`);
        const dest = bankAccounts.find((a) => a.id === selectedCashAccountId);
        if (dest) {
          paymentDetailParts.push(
            `To: ${dest.name}${dest.bankName ? ` (${dest.bankName})` : ""}${dest.accountNumber ? ` ${dest.accountNumber}` : ""}`,
          );
        }
      }
      const salePayload: OutboxSalePayload = {
        warehouseId,
        branchId,
        customerId: resolvedCustomerId,
        notes:
          saleMode === "CREDIT"
            ? `Credit invoice${receiptNote ? ` · ${receiptNote}` : ""}`
            : receiptNote
              ? `Cash sale · ${receiptNote}`
              : "Cash sale",
        paymentMethod: effectiveMethod,
        cashAccountId:
          saleMode === "CREDIT" ? null : selectedCashAccountId || null,
        paymentReference: paymentReference.trim() || null,
        paymentDetail: paymentDetailParts.length
          ? paymentDetailParts.join(" · ")
          : null,
        items: cart.map((l) => ({
          productId: l.productId,
          quantity: l.quantity,
          unitId: l.unitId,
          preferredBatchIds: l.selectedBatchId ? [l.selectedBatchId] : [],
          unitPrice: l.unitPrice,
          serialNumbers: l.serialized ? l.selectedSerials : [],
          name: l.name,
        })),
        pendingCustomer:
          !resolvedCustomerId && customerPhone.trim().length >= 7
            ? {
                phone: customerPhone.trim(),
                firstName: customerName.trim() || null,
              }
            : null,
        totalHint: total,
        clientSaleId: newOutboxId(),
      };

      // Offline or network failure → queue, never drop the sale
      if (typeof navigator !== "undefined" && !navigator.onLine) {
        await outboxEnqueue({
          id: salePayload.clientSaleId,
          type: "create_sale",
          createdAt: new Date().toISOString(),
          payload: salePayload,
          attempts: 0,
        });
        await refreshOutbox();
        toast.success("Sale saved offline — will sync when online");
        setStockMap((prev) => {
          const next = { ...prev };
          const wh = warehouseId;
          for (const l of cart) {
            const factor = l.factorToStock > 0 ? l.factorToStock : 1;
            const need = l.quantity * factor;
            const byWh = { ...(next[l.productId] ?? {}) };
            const cur = Number(byWh[wh] ?? 0);
            byWh[wh] = Math.max(0, cur - need);
            next[l.productId] = byWh;
          }
          return next;
        });
        setLastReceipt({
          invoiceNumber: offlineInvoiceLabel(salePayload.clientSaleId),
          soldAt: new Date().toLocaleString("en-KE", {
            timeZone: "Africa/Nairobi",
          }),
          total: total,
          subtotal: total,
          amountPaid: saleMode === "CREDIT" ? 0 : total,
          balanceDue: saleMode === "CREDIT" ? total : 0,
          paymentMethod: effectiveMethod,
          isCredit: saleMode === "CREDIT",
          notes: salePayload.notes,
          lines: cart.map((l) => ({
            name: l.name,
            quantity: l.quantity,
            unitPrice: l.unitPrice,
            total: l.quantity * l.unitPrice,
            serialNumbers: l.serialized ? l.selectedSerials : [],
          })),
          offline: true,
        });
        setCart([]);
        setAmountTendered("");
        setPaymentReference("");
        setOriginBank("");
        scanRef.current?.focus();
        return;
      }

      let result: { success: boolean; message: string };
      try {
        result = await createSaleAction({
          warehouseId: salePayload.warehouseId,
          branchId: salePayload.branchId,
          customerId: salePayload.customerId,
          notes: salePayload.notes,
          paymentMethod: salePayload.paymentMethod,
          cashAccountId: salePayload.cashAccountId ?? null,
          paymentReference: salePayload.paymentReference ?? null,
          paymentDetail: salePayload.paymentDetail ?? null,
          items: salePayload.items,
          clientSaleId: salePayload.clientSaleId,
        });
      } catch (e) {
        await outboxEnqueue({
          id: salePayload.clientSaleId,
          type: "create_sale",
          createdAt: new Date().toISOString(),
          payload: salePayload,
          attempts: 0,
          lastError: e instanceof Error ? e.message : String(e),
        });
        await refreshOutbox();
        toast.success("Network issue — sale queued offline for sync");
        setCart([]);
        setAmountTendered("");
        scanRef.current?.focus();
        return;
      }

      if (!result.success) {
        toast.error(result.message);
        return;
      }

      // Build printable receipt from cart + server response
      const res = result as {
        invoiceNumber?: string;
        total?: number;
        subtotal?: number;
        amountPaid?: number;
        balanceDue?: number;
        paymentMethod?: string;
        isCredit?: boolean;
        soldAt?: string;
        notes?: string | null;
      };
      const tenderedNum = Number(amountTendered);
      const saleTotal = Number(res.total ?? total);
      const paidNum = Number(
        res.isCredit || saleMode === "CREDIT"
          ? (res.amountPaid ?? 0)
          : saleTotal,
      );
      const changeNum =
        !res.isCredit &&
        saleMode !== "CREDIT" &&
        Number.isFinite(tenderedNum) &&
        tenderedNum > 0
          ? Math.max(0, tenderedNum - saleTotal)
          : 0;
      setCheckoutOpen(false);
      setMobileCartOpen(false);
      setLastReceipt({
        invoiceNumber: res.invoiceNumber ?? "—",
        soldAt:
          res.soldAt ??
          new Date().toLocaleString("en-KE", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
            timeZone: "Africa/Nairobi",
          }),
        cashierName: cashierName ?? null,
        customerName:
          (res as { customerDisplayName?: string }).customerDisplayName ||
          customerLabel ||
          customerName.trim() ||
          null,
        contactName:
          (res as { customerContactName?: string | null })
            .customerContactName ||
          customerContactName ||
          null,
        customerPhone:
          (res as { customerPhone?: string | null }).customerPhone ||
          customerPhone.trim() ||
          null,
        paymentMethod: res.paymentMethod ?? effectiveMethod,
        isCredit: Boolean(res.isCredit ?? saleMode === "CREDIT"),
        amountPaid: paidNum,
        balanceDue: Number(res.balanceDue ?? 0),
        amountTendered:
          Number.isFinite(tenderedNum) && tenderedNum > 0
            ? tenderedNum
            : paidNum,
        changeDue: changeNum,
        subtotal: Number(res.subtotal ?? total),
        total: saleTotal,
        notes: salePayload.notes,
        etims: (res as { etims?: ReceiptData["etims"] }).etims ?? null,
        lines: cart.map((l) => ({
          name: l.name,
          quantity: l.quantity,
          unitLabel: l.unitLabel ?? null,
          unitPrice: l.unitPrice,
          total: l.quantity * l.unitPrice,
          sku: l.sku ?? null,
          serialNumbers:
            l.serialized && l.selectedSerials.length > 0
              ? [...l.selectedSerials]
              : undefined,
        })),
      });

      if (resolvedCustomerId) {
        const preview = await previewLoyaltyEarnAction(total).catch(() => null);
        const pts = preview?.success ? preview.points : estimatedEarn;
        toast.success(
          pts > 0
            ? `${result.message} · ~${pts} loyalty point(s) awarded`
            : result.message,
        );
      } else {
        toast.success(result.message);
      }
      setCart([]);
      setAmountTendered("");
      // Keep member phone for next sale (supermarket style); clear if walk-in only
      if (!resolvedCustomerId) {
        setCustomerName("");
        setCustomerPhone("");
        setCustomerPoints(null);
      }
      setSerialPool((prev) => {
        const next = { ...prev };
        for (const line of cart) {
          if (!line.serialized) continue;
          const sold = new Set(line.selectedSerials);
          next[line.productId] = (next[line.productId] ?? []).filter(
            (s) => !sold.has(s),
          );
        }
        return next;
      });
      refresh();
      scanRef.current?.focus();
    });
  };
}
