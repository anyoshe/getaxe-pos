"use client";

import type { Dispatch, SetStateAction } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { PosCustomerOption } from "../../actions/pos-customer";

export type NewPosCustomerDraft = {
  customerType: "INDIVIDUAL" | "BUSINESS";
  firstName: string;
  lastName: string;
  companyName: string;
  tradingName: string;
  phone: string;
  idNumber: string;
  registrationNumber: string;
  taxPin: string;
  address: string;
  emergencyContact: string;
  emergencyPhone: string;
  creditLimit: string;
};

export type PosCustomerDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "select" | "create";
  setMode: (mode: "select" | "create") => void;
  saleMode: "CASH" | "CREDIT";
  customerId: string | null;
  setCustomerId: (id: string | null) => void;
  setCustomerLabel: (v: string | null) => void;
  setCustomerPhone: (v: string) => void;
  setCustomerName: (v: string) => void;
  setCustomerPoints: (v: number | null) => void;
  setCustomerContactName: (v: string | null) => void;
  customerPhone: string;
  clearCustomer: () => void;
  openCustomerDialog: (mode?: "select" | "create") => void;
  lookupCustomer: () => Promise<void>;
  lookingUp: boolean;
  posCustomers: PosCustomerOption[];
  newCustomer: NewPosCustomerDraft;
  setNewCustomer: Dispatch<SetStateAction<NewPosCustomerDraft>>;
  customerSaving: boolean;
  onCreate: () => void;
  onContinueCheckout: () => void;
};

export function PosCustomerDialog({
  open,
  onOpenChange,
  mode,
  setMode,
  saleMode,
  customerId,
  setCustomerId,
  setCustomerLabel,
  setCustomerPhone,
  setCustomerName,
  setCustomerPoints,
  setCustomerContactName,
  customerPhone,
  clearCustomer,
  openCustomerDialog,
  lookupCustomer,
  lookingUp,
  posCustomers,
  newCustomer,
  setNewCustomer,
  customerSaving,
  onCreate,
  onContinueCheckout,
}: PosCustomerDialogProps) {
  return (
        <Dialog open={open} onOpenChange={onOpenChange}>
          <DialogContent className="flex max-h-[90dvh] max-w-2xl flex-col gap-0 overflow-hidden p-0">
            <div className="brand-stripe h-2 w-full shrink-0" />
            <DialogHeader className="shrink-0 border-b px-5 py-4">
              <DialogTitle className="text-xl font-bold text-primary">
                {mode === "select" ? "Customer details" : "Create customer"}
              </DialogTitle>
              <DialogDescription className="leading-5">
                {saleMode === "CREDIT"
                  ? "Select a customer approved for credit, or create a credit customer account."
                  : "Select an existing customer or add details for this sale."}
              </DialogDescription>
            </DialogHeader>

            <div className="flex shrink-0 gap-2 border-b bg-muted/30 px-5 py-3">
              <Button
                type="button"
                variant={mode === "select" ? "default" : "outline"}
                className="rounded-xl"
                onClick={() => setMode("select")}
              >
                Select customer
              </Button>
              <Button
                type="button"
                variant={mode === "create" ? "default" : "outline"}
                className="rounded-xl"
                onClick={() => openCustomerDialog("create")}
              >
                Create customer
              </Button>
            </div>

            {mode === "select" ? (
              <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-5">
                <div className="space-y-2">
                  <Label htmlFor="pos-customer-select">
                    {saleMode === "CREDIT" ? "Credit customer" : "Customer"}
                  </Label>
                  <select
                    id="pos-customer-select"
                    className="h-11 w-full rounded-xl border border-input bg-background px-3 text-sm"
                    value={
                      saleMode === "CREDIT" &&
                      !posCustomers.find((customer) => customer.id === customerId)?.allowCredit
                        ? ""
                        : customerId ?? ""
                    }
                    onChange={(event) => {
                      const selected = posCustomers.find((customer) => customer.id === event.target.value);
                      if (!selected) {
                        clearCustomer();
                        return;
                      }
                      setCustomerId(selected.id);
                      setCustomerLabel(selected.displayName);
                      setCustomerContactName(selected.contactName);
                      setCustomerPhone(selected.phone ?? "");
                      setCustomerName(selected.contactName || selected.displayName);
                      setCustomerPoints(selected.loyaltyPoints);
                    }}
                  >
                    <option value="">
                      {saleMode === "CREDIT" ? "Choose an eligible customer…" : "Walk-in / no customer"}
                    </option>
                    {(saleMode === "CREDIT" ? posCustomers.filter((customer) => customer.allowCredit) : posCustomers).map((customer) => (
                      <option key={customer.id} value={customer.id}>
                        {customer.displayName}{customer.phone ? ` · ${customer.phone}` : ""}{customer.allowCredit ? " · Credit" : ""}
                      </option>
                    ))}
                  </select>
                  {saleMode === "CREDIT" && posCustomers.filter((customer) => customer.allowCredit).length === 0 ? (
                    <p className="rounded-xl border border-accent/50 bg-accent/20 p-3 text-sm leading-5 text-foreground">
                      No credit customers are available yet. Create a customer and enable a credit account to continue.
                    </p>
                  ) : null}
                  {saleMode === "CREDIT" &&
                  posCustomers.some((customer) => customer.allowCredit) &&
                  customerId &&
                  !posCustomers.find((customer) => customer.id === customerId)?.allowCredit ? (
                    <p className="rounded-xl border border-accent/50 bg-accent/20 p-3 text-sm leading-5 text-foreground">
                      The currently selected customer is not enabled for credit. Choose an eligible account or create a credit customer.
                    </p>
                  ) : null}
                </div>
                <div className="grid gap-2 sm:grid-cols-[1fr_auto]">
                  <Input
                    className="h-10 rounded-xl"
                    inputMode="tel"
                    placeholder="Find customer by phone"
                    value={customerPhone}
                    onChange={(event) => setCustomerPhone(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        event.preventDefault();
                        void lookupCustomer();
                      }
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    className="h-10 rounded-xl border-primary/25 text-primary"
                    disabled={lookingUp || !customerPhone.trim()}
                    onClick={() => void lookupCustomer()}
                  >
                    {lookingUp ? "Searching…" : "Find by phone"}
                  </Button>
                </div>
              </div>
            ) : (
              <form
                className="min-h-0 flex-1 space-y-4 overflow-y-auto p-5"
                onSubmit={(event) => {
                  event.preventDefault();
                  void onCreate();
                }}
              >
                <div className="flex gap-2 rounded-xl border border-border/60 bg-muted/30 p-1">
                  {(["INDIVIDUAL", "BUSINESS"] as const).map((typ) => (
                    <button
                      key={typ}
                      type="button"
                      onClick={() =>
                        setNewCustomer((current) => ({
                          ...current,
                          customerType: typ,
                        }))
                      }
                      className={
                        "flex-1 rounded-lg px-3 py-2 text-sm font-semibold transition " +
                        (newCustomer.customerType === typ
                          ? "bg-primary text-primary-foreground shadow-sm"
                          : "text-muted-foreground hover:bg-background")
                      }
                    >
                      {typ === "INDIVIDUAL" ? "Person" : "Company"}
                    </button>
                  ))}
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  {newCustomer.customerType === "BUSINESS" ? (
                    <>
                      <div className="space-y-1.5 sm:col-span-2">
                        <Label htmlFor="new-pos-customer-company">Company / business name *</Label>
                        <Input
                          id="new-pos-customer-company"
                          className="h-10 rounded-xl"
                          required
                          value={newCustomer.companyName}
                          onChange={(event) =>
                            setNewCustomer((current) => ({
                              ...current,
                              companyName: event.target.value,
                            }))
                          }
                          placeholder="Legal name as registered"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="new-pos-customer-first">Contact first name *</Label>
                        <Input
                          id="new-pos-customer-first"
                          className="h-10 rounded-xl"
                          required
                          value={newCustomer.firstName}
                          onChange={(event) =>
                            setNewCustomer((current) => ({
                              ...current,
                              firstName: event.target.value,
                            }))
                          }
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="new-pos-customer-last">Contact surname</Label>
                        <Input
                          id="new-pos-customer-last"
                          className="h-10 rounded-xl"
                          value={newCustomer.lastName}
                          onChange={(event) =>
                            setNewCustomer((current) => ({
                              ...current,
                              lastName: event.target.value,
                            }))
                          }
                        />
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="space-y-1.5">
                        <Label htmlFor="new-pos-customer-first">First name *</Label>
                        <Input
                          id="new-pos-customer-first"
                          className="h-10 rounded-xl"
                          required
                          value={newCustomer.firstName}
                          onChange={(event) =>
                            setNewCustomer((current) => ({
                              ...current,
                              firstName: event.target.value,
                            }))
                          }
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="new-pos-customer-last">Last name</Label>
                        <Input
                          id="new-pos-customer-last"
                          className="h-10 rounded-xl"
                          value={newCustomer.lastName}
                          onChange={(event) =>
                            setNewCustomer((current) => ({
                              ...current,
                              lastName: event.target.value,
                            }))
                          }
                        />
                      </div>
                    </>
                  )}
                  <div className="space-y-1.5 sm:col-span-2">
                    <Label htmlFor="new-pos-customer-phone">Phone *</Label>
                    <Input
                      id="new-pos-customer-phone"
                      className="h-10 rounded-xl"
                      required
                      minLength={7}
                      inputMode="tel"
                      value={newCustomer.phone}
                      onChange={(event) =>
                        setNewCustomer((current) => ({
                          ...current,
                          phone: event.target.value,
                        }))
                      }
                    />
                  </div>
                  {saleMode === "CREDIT" ? (
                    <>
                      {newCustomer.customerType === "BUSINESS" ? (
                        <>
                          <div className="space-y-1.5">
                            <Label htmlFor="new-pos-customer-reg">Registration no. *</Label>
                            <Input
                              id="new-pos-customer-reg"
                              className="h-10 rounded-xl"
                              required
                              value={newCustomer.registrationNumber}
                              onChange={(event) =>
                                setNewCustomer((current) => ({
                                  ...current,
                                  registrationNumber: event.target.value,
                                }))
                              }
                              placeholder="PVT- / BN-"
                            />
                          </div>
                          <div className="space-y-1.5">
                            <Label htmlFor="new-pos-customer-pin">KRA PIN *</Label>
                            <Input
                              id="new-pos-customer-pin"
                              className="h-10 rounded-xl"
                              required
                              value={newCustomer.taxPin}
                              onChange={(event) =>
                                setNewCustomer((current) => ({
                                  ...current,
                                  taxPin: event.target.value,
                                }))
                              }
                            />
                          </div>
                        </>
                      ) : (
                        <div className="space-y-1.5 sm:col-span-2">
                          <Label htmlFor="new-pos-customer-id">National ID / passport *</Label>
                          <Input
                            id="new-pos-customer-id"
                            className="h-10 rounded-xl"
                            required
                            value={newCustomer.idNumber}
                            onChange={(event) =>
                              setNewCustomer((current) => ({
                                ...current,
                                idNumber: event.target.value,
                              }))
                            }
                          />
                        </div>
                      )}
                      <div className="space-y-1.5 sm:col-span-2">
                        <Label htmlFor="new-pos-customer-address">
                          {newCustomer.customerType === "BUSINESS"
                            ? "Business address *"
                            : "Physical address *"}
                        </Label>
                        <Input
                          id="new-pos-customer-address"
                          className="h-10 rounded-xl"
                          required
                          value={newCustomer.address}
                          onChange={(event) =>
                            setNewCustomer((current) => ({
                              ...current,
                              address: event.target.value,
                            }))
                          }
                        />
                      </div>
                      {newCustomer.customerType === "INDIVIDUAL" ? (
                        <>
                          <div className="space-y-1.5">
                            <Label htmlFor="new-pos-customer-next-kin">Next of kin *</Label>
                            <Input
                              id="new-pos-customer-next-kin"
                              className="h-10 rounded-xl"
                              required
                              value={newCustomer.emergencyContact}
                              onChange={(event) =>
                                setNewCustomer((current) => ({
                                  ...current,
                                  emergencyContact: event.target.value,
                                }))
                              }
                            />
                          </div>
                          <div className="space-y-1.5">
                            <Label htmlFor="new-pos-customer-next-phone">Next of kin phone *</Label>
                            <Input
                              id="new-pos-customer-next-phone"
                              className="h-10 rounded-xl"
                              required
                              inputMode="tel"
                              value={newCustomer.emergencyPhone}
                              onChange={(event) =>
                                setNewCustomer((current) => ({
                                  ...current,
                                  emergencyPhone: event.target.value,
                                }))
                              }
                            />
                          </div>
                        </>
                      ) : null}
                      <div className="space-y-1.5">
                        <Label htmlFor="new-pos-customer-limit">Credit limit (KES) *</Label>
                        <Input
                          id="new-pos-customer-limit"
                          className="h-10 rounded-xl"
                          required
                          type="number"
                          min="1"
                          step="0.01"
                          value={newCustomer.creditLimit}
                          onChange={(event) =>
                            setNewCustomer((current) => ({
                              ...current,
                              creditLimit: event.target.value,
                            }))
                          }
                        />
                      </div>
                      <p className="self-end text-xs leading-5 text-muted-foreground">
                        {newCustomer.customerType === "BUSINESS"
                          ? "Company credit account — registration and KRA PIN required."
                          : "Person credit account — ID and next of kin required."}
                      </p>
                    </>
                  ) : null}
                </div>
                <DialogFooter className="-mx-5 -mb-5 border-t bg-muted/30 px-5 py-4">
                  <Button type="button" variant="outline" className="rounded-xl" onClick={() => setMode("select")}>
                    Back
                  </Button>
                  <Button type="submit" className="rounded-xl" disabled={customerSaving}>
                    {customerSaving ? "Saving…" : saleMode === "CREDIT" ? "Create credit customer" : "Create customer"}
                  </Button>
                </DialogFooter>
              </form>
            )}

            {mode === "select" ? (
              <DialogFooter className="shrink-0 border-t bg-muted/30 px-5 py-4">
                <Button
                  type="button"
                  variant="outline"
                  className="rounded-xl"
                  onClick={() => onOpenChange(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  className="rounded-xl"
                  disabled={saleMode === "CREDIT" && !posCustomers.find((customer) => customer.id === customerId)?.allowCredit}
                  onClick={() => {
                    onOpenChange(false);
                    onContinueCheckout();
                  }}
                >
                  {saleMode === "CREDIT" ? "Continue to checkout" : "Use customer"}
                </Button>
              </DialogFooter>
            ) : null}
          </DialogContent>
        </Dialog>
  );
}
