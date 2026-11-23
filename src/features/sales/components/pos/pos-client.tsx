"use client";

import { useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Banknote, Building2, CreditCard, Smartphone } from "lucide-react";

import {
  initiateMpesaStkAction,
  queryMpesaStkAction,
} from "@/features/finance/actions/mpesa";
import { SaleReceipt } from "./sale-receipt";
import { PosStatusStrip } from "./pos-status-strip";
import { PosCustomerDialog } from "./pos-customer-dialog";
import { PosCheckoutDialog } from "./pos-checkout-dialog";
import { PosCatalogPanel } from "./pos-catalog-panel";
import { PosCartPanel } from "./pos-cart-panel";
import { PosHeader } from "./pos-header";
import { PosMobileCart } from "./pos-mobile-cart";
import { createPosCheckoutHandler } from "./pos-checkout-handler";
import { usePosClientState } from "./use-pos-client-state";
import { useOffline } from "@/providers/offline-provider";
import {
  savePosCatalog,
} from "@/lib/offline/outbox";

import type { PosClientProps } from "./pos-types";

// Re-export for page consumers that imported from pos-client
export type {
  PosProduct,
  PosProductUnit,
  StockByProductWarehouse,
  SerialsByProductWarehouse,
  PosBatchOption,
  ActivePromotion,
} from "./pos-types";

export function PosClient({
  business,
  products,
  warehouses,
  branches,
  availableSerials: initialSerials,
  stockByProductWarehouse = {},
  serialsByProductWarehouse = {},
  productUnitsByProduct = {},
  pricesByProductUnit = {},
  batchesByProductWarehouse = {},
  activePromotions = [],
  fullScreen = false,
  cashierName,
  recentSales = [],
  cashAccounts = [],
  etimsStatusLabel = null,
  belowCostSalePolicy = "block",
}: PosClientProps) {
  const router = useRouter();
  const { online, pendingCount, refreshOutbox, flushOutbox } = useOffline();

  // Keep a local catalog snapshot so search still works briefly offline
  useEffect(() => {
    if (!online) return;
    void savePosCatalog({
      savedAt: new Date().toISOString(),
      products: products as unknown[],
      stockByProductWarehouse: stockByProductWarehouse as Record<
        string,
        Record<string, number>
      >,
    });
  }, [online, products, stockByProductWarehouse]);
  const [pending, startTransition] = useTransition();
  const posState = usePosClientState({
    business,
    products,
    warehouses,
    branches,
    availableSerials: initialSerials,
    stockByProductWarehouse,
    serialsByProductWarehouse,
    productUnitsByProduct,
    pricesByProductUnit,
    batchesByProductWarehouse,
    activePromotions,
    fullScreen,
    cashierName,
    recentSales,
    cashAccounts,
    etimsStatusLabel,
    belowCostSalePolicy,
  });
  const {
    scanRef,
    setStockMap,
    unitsMap,
    query,
    setQuery,
    sellable,
    categoryFilter,
    setCategoryFilter,
    catalogLayout,
    setCatalogLayout,
    posView,
    setPosView,
    setVisibleCount,
    priceMode,
    setPriceMode,
    warehouseId,
    setWarehouseId,
    branchId,
    setBranchId,
    paymentMethod,
    setPaymentMethod,
    mobileProvider,
    setMobileProvider,
    mpesaStkEnabled,
    mpesaSim,
    stkBusy,
    setStkBusy,
    stkStatus,
    setStkStatus,
    bankChannel,
    setBankChannel,
    paymentReference,
    setPaymentReference,
    originBank,
    setOriginBank,
    selectedCashAccountId,
    setSelectedCashAccountId,
    saleMode,
    setSaleMode,
    lastReceipt,
    setLastReceipt,
    amountTendered,
    setAmountTendered,
    checkoutOpen,
    setCheckoutOpen,
    mobileCartOpen,
    setMobileCartOpen,
    posOptionsOpen,
    setPosOptionsOpen,
    customerDialogOpen,
    setCustomerDialogOpen,
    customerDialogMode,
    setCustomerDialogMode,
    customerSaving,
    newCustomer,
    setNewCustomer,
    customerPhone,
    setCustomerPhone,
    customerName,
    setCustomerName,
    customerId,
    setCustomerId,
    customerLabel,
    setCustomerLabel,
    customerPoints,
    setCustomerPoints,
    customerContactName,
    setCustomerContactName,
    posCustomers,
    setPosCustomers,
    lookingUp,
    cart,
    setCart,
    setSerialPool,
    showCamera,
    setShowCamera,
    stockOnHand,
    batchesFor,
    categories,
    filtered,
    visibleProducts,
    freeSerials,
    addProduct,
    setLineUnit,
    searchHits,
    resolveCode,
    onScanKeyDown,
    toggleSerial,
    lookupCustomer,
    clearCustomer,
    openCustomerDialog,
    createPosCustomer,
    total,
    missingSerialLines,
    notifyMissingSerials,
    estimatedEarn,
  } = posState;

  async function requestMpesaStk() {
    const phone =
      customerPhone.trim() ||
      (customerLabel && /\d{9,}/.test(customerLabel) ? customerLabel : "");
    if (!phone) {
      toast.error("Enter customer phone (07…) to send M-Pesa STK.");
      return;
    }
    if (total <= 0) {
      toast.error("Cart total must be greater than zero.");
      return;
    }
    setStkBusy(true);
    setStkStatus("Sending prompt…");
    try {
      const start = await initiateMpesaStkAction({
        phone,
        amount: total,
        cashAccountId: selectedCashAccountId || null,
      });
      if (!start.success) {
        toast.error(start.message);
        setStkStatus(null);
        return;
      }
      toast.message(start.message);
      setStkStatus(start.simulated ? "Simulation — confirming…" : "Waiting for PIN…");
      // Poll up to ~90s
      for (let i = 0; i < 30; i++) {
        await new Promise((r) => setTimeout(r, 3000));
        const q = await queryMpesaStkAction({
          requestId: start.requestId,
          checkoutRequestId: start.checkoutRequestId,
        });
        if (!q.success) continue;
        if (q.status === "SUCCESS") {
          const receipt = q.mpesaReceipt || start.checkoutRequestId;
          setPaymentReference(receipt);
          setStkStatus(`Paid · ${receipt}`);
          toast.success(`M-Pesa confirmed: ${receipt}`);
          setStkBusy(false);
          return;
        }
        if (q.status === "FAILED" || q.status === "CANCELLED") {
          setStkStatus(q.resultDesc || q.status);
          toast.error(q.resultDesc || "M-Pesa payment not completed");
          setStkBusy(false);
          return;
        }
        setStkStatus(`Waiting for PIN… (${i + 1})`);
      }
      setStkStatus("Still pending — enter code manually if paid");
      toast.message("STK still pending. If customer paid, type the M-Pesa code below.");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "STK failed");
      setStkStatus(null);
    } finally {
      setStkBusy(false);
    }
  }

  const shell = fullScreen
    ? "fixed inset-0 z-50 flex flex-col overflow-hidden bg-background"
    : "flex h-[min(100dvh,56rem)] max-h-[100dvh] flex-col overflow-hidden rounded-2xl border shadow-sm";

  const changeDue =
    paymentMethod === "CASH" && amountTendered
      ? Math.max(0, Number(amountTendered) - total)
      : null;

  const bankAccounts = cashAccounts.filter(
    (a) => a.active !== false && a.type === "BANK" && !a.name.toLowerCase().includes("card"),
  );
  const mpesaAccounts = cashAccounts.filter(
    (a) => a.active !== false && a.type === "MPESA",
  );
  const mobileAccounts = cashAccounts.filter(
    (a) => a.active !== false && a.type === "MOBILE_MONEY",
  );
  const cardAccounts = cashAccounts.filter(
    (a) =>
      a.active !== false &&
      (a.type === "BANK" && a.name.toLowerCase().includes("card")),
  );

  const payMethods: {
    id: typeof paymentMethod;
    label: string;
    icon: typeof Banknote;
    activeClass: string;
    idleClass: string;
  }[] = [
    {
      id: "CASH",
      label: "Cash",
      icon: Banknote,
      activeClass: "bg-primary text-primary-foreground shadow-md ring-2 ring-primary/30",
      idleClass:
        "border border-primary/20 bg-primary/5 text-primary hover:bg-primary/10",
    },
    {
      id: "MPESA",
      label: "M-Pesa",
      icon: Smartphone,
      activeClass: "bg-accent text-accent-foreground shadow-md ring-2 ring-accent/50",
      idleClass:
        "border border-accent/70 bg-accent/30 text-accent-foreground hover:bg-accent/50",
    },
    {
      id: "CARD",
      label: "Card",
      icon: CreditCard,
      activeClass: "bg-primary text-primary-foreground shadow-md ring-2 ring-primary/40",
      idleClass:
        "border border-primary/30 bg-primary/10 text-primary hover:bg-primary/15",
    },
    {
      id: "BANK_TRANSFER",
      label: "Bank",
      icon: Building2,
      activeClass: "bg-primary text-primary-foreground shadow-md ring-2 ring-primary/30",
      idleClass:
        "border border-primary/20 bg-primary/5 text-primary hover:bg-primary/10",
    },
  ];

  const posStep: 1 | 2 | 3 = checkoutOpen ? 3 : cart.length > 0 ? 2 : 1;

  const checkout = createPosCheckoutHandler({
    startTransition,
    refresh: () => router.refresh(),
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
    amountTendered,
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
  });

  return (
    <div className={shell}>
      <div className="brand-stripe h-1.5 w-full shrink-0" />

      <PosStatusStrip
        online={online}
        pendingCount={pendingCount}
        onFlushOutbox={() => {
          void flushOutbox();
        }}
        mpesaLabel={
          stkBusy
            ? "Sending STK…"
            : stkStatus
              ? stkStatus.slice(0, 48)
              : paymentMethod === "MPESA" ||
                  (paymentMethod === "MOBILE_MONEY" && mobileProvider === "MPESA")
                ? mpesaStkEnabled
                  ? "Ready"
                  : "Manual / code"
                : null
        }
        mpesaTone={
          stkBusy
            ? "busy"
            : stkStatus && /fail|error|cancel/i.test(stkStatus)
              ? "error"
              : stkStatus && /success|paid|complete/i.test(stkStatus)
                ? "ok"
                : "idle"
        }
        etimsLabel={etimsStatusLabel}
      />

      <PosHeader
        cashierName={cashierName}
        branches={branches}
        branchId={branchId}
        posStep={posStep}
        posView={posView}
        setPosView={setPosView}
        posOptionsOpen={posOptionsOpen}
        setPosOptionsOpen={setPosOptionsOpen}
        fullScreen={fullScreen}
        priceMode={priceMode}
        setPriceMode={setPriceMode}
        warehouseId={warehouseId}
        setWarehouseId={setWarehouseId}
        warehouses={warehouses}
        onWarehouseChange={(id) => {
          const warehouse = warehouses.find((item) => item.id === id);
          if (warehouse?.branchId) setBranchId(warehouse.branchId);
        }}
      />

      {/* POS workspace: catalogue and selected products share the desktop width equally. */}
      <div className="mx-auto flex min-h-0 w-full flex-1 flex-col overflow-hidden xl:max-w-[1720px] xl:px-8 2xl:px-12 xl:grid xl:grid-cols-[60%_40%] xl:grid-rows-1">
        <PosCatalogPanel
          scanRef={scanRef}
          query={query}
          setQuery={setQuery}
          onScanKeyDown={onScanKeyDown}
          posView={posView}
          showCamera={showCamera}
          setShowCamera={setShowCamera}
          categoryFilter={categoryFilter}
          setCategoryFilter={setCategoryFilter}
          categories={categories}
          catalogLayout={catalogLayout}
          setCatalogLayout={setCatalogLayout}
          sellable={sellable}
          filtered={filtered}
          visibleProducts={visibleProducts}
          setVisibleCount={setVisibleCount}
          stockOnHand={stockOnHand}
          addProduct={addProduct}
          cart={cart}
          setCart={setCart}
          unitsMap={unitsMap}
          priceMode={priceMode}
          resolveCode={resolveCode}
          setLineUnit={setLineUnit}
          batchesFor={batchesFor}
          toggleSerial={toggleSerial}
          freeSerials={freeSerials}
          searchHits={searchHits}
        />
        <PosCartPanel
          posView={posView}
          cart={cart}
          setCart={setCart}
          unitsMap={unitsMap}
          setLineUnit={setLineUnit}
          total={total}
          missingSerialLines={missingSerialLines}
          notifyMissingSerials={notifyMissingSerials}
          setCheckoutOpen={setCheckoutOpen}
          batchesFor={batchesFor}
          toggleSerial={toggleSerial}
          freeSerials={freeSerials}
        />
        <PosCheckoutDialog
          open={checkoutOpen}
          onOpenChange={setCheckoutOpen}
          saleMode={saleMode}
          setSaleMode={setSaleMode}
          paymentMethod={paymentMethod}
          setPaymentMethod={setPaymentMethod}
          mobileProvider={mobileProvider}
          setMobileProvider={setMobileProvider}
          bankChannel={bankChannel}
          setBankChannel={setBankChannel}
          selectedCashAccountId={selectedCashAccountId}
          setSelectedCashAccountId={setSelectedCashAccountId}
          mpesaAccounts={mpesaAccounts}
          mobileAccounts={mobileAccounts}
          bankAccounts={bankAccounts}
          cardAccounts={cardAccounts}
          originBank={originBank}
          setOriginBank={setOriginBank}
          paymentReference={paymentReference}
          setPaymentReference={setPaymentReference}
          amountTendered={amountTendered}
          setAmountTendered={setAmountTendered}
          changeDue={changeDue}
          total={total}
          cart={cart}
          customerId={customerId}
          customerLabel={customerLabel}
          customerPhone={customerPhone}
          customerPoints={customerPoints}
          posCustomers={posCustomers}
          mpesaStkEnabled={mpesaStkEnabled}
          stkBusy={stkBusy}
          requestMpesaStk={requestMpesaStk}
          mpesaSim={mpesaSim}
          stkStatus={stkStatus}
          clearCustomer={clearCustomer}
          openCustomerDialog={openCustomerDialog}
          pending={pending}
          missingSerialLines={missingSerialLines}
          checkout={checkout}
          payMethods={payMethods}
        />

        <PosCustomerDialog
          open={customerDialogOpen}
          onOpenChange={setCustomerDialogOpen}
          mode={customerDialogMode}
          setMode={setCustomerDialogMode}
          saleMode={saleMode}
          customerId={customerId}
          setCustomerId={setCustomerId}
          setCustomerLabel={setCustomerLabel}
          setCustomerPhone={setCustomerPhone}
          setCustomerName={setCustomerName}
          setCustomerPoints={setCustomerPoints}
          setCustomerContactName={setCustomerContactName}
          customerPhone={customerPhone}
          clearCustomer={clearCustomer}
          openCustomerDialog={openCustomerDialog}
          lookupCustomer={lookupCustomer}
          lookingUp={lookingUp}
          posCustomers={posCustomers}
          newCustomer={newCustomer}
          setNewCustomer={setNewCustomer}
          customerSaving={customerSaving}
          onCreate={() => {
            void createPosCustomer();
          }}
          onContinueCheckout={() => {
            if (saleMode === "CREDIT") setCheckoutOpen(true);
          }}
        />

      </div>


      <PosMobileCart
        open={mobileCartOpen}
        setOpen={setMobileCartOpen}
        cart={cart}
        total={total}
        setCart={setCart}
        freeSerials={freeSerials}
        toggleSerial={toggleSerial}
        notifyMissingSerials={notifyMissingSerials}
        setCheckoutOpen={setCheckoutOpen}
      />


      {lastReceipt ? (
        <SaleReceipt
          open={!!lastReceipt}
          business={
            business ?? {
              name: "GetAxe POS",
              currency: "KES",
            }
          }
          receipt={lastReceipt}
          onClose={() => setLastReceipt(null)}
          autoPrint
        />
      ) : null}
    </div>
  );
}
