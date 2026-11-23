"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";

import { createCustomerAction } from "../../actions/create-customer";
import {
  listPosCustomersAction,
  lookupCustomerByPhoneAction,
  type PosCustomerOption,
} from "../../actions/pos-customer";
import type { NewPosCustomerDraft } from "./pos-customer-dialog";

export function usePosCustomerState(
  saleMode: "CASH" | "CREDIT",
  setCheckoutOpen: (open: boolean) => void,
) {
  const [customerDialogOpen, setCustomerDialogOpen] = useState(false);
  const [customerDialogMode, setCustomerDialogMode] = useState<
    "select" | "create"
  >("select");
  const [customerSaving, setCustomerSaving] = useState(false);
  const [newCustomer, setNewCustomer] = useState<NewPosCustomerDraft>({
    customerType: "INDIVIDUAL" as "INDIVIDUAL" | "BUSINESS",
    firstName: "",
    lastName: "",
    companyName: "",
    tradingName: "",
    registrationNumber: "",
    taxPin: "",
    phone: "",
    idNumber: "",
    address: "",
    emergencyContact: "",
    emergencyPhone: "",
    creditLimit: "",
  });
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerId, setCustomerId] = useState<string | null>(null);
  const [customerLabel, setCustomerLabel] = useState<string | null>(null);
  const [customerPoints, setCustomerPoints] = useState<number | null>(null);
  const [customerContactName, setCustomerContactName] = useState<string | null>(
    null,
  );
  const [posCustomers, setPosCustomers] = useState<PosCustomerOption[]>([]);
  const [earnPreview, setEarnPreview] = useState<number | null>(null);
  const [lookingUp, setLookingUp] = useState(false);
  useEffect(() => {
    void listPosCustomersAction().then((result) => {
      if (result.success) setPosCustomers(result.customers);
    });
  }, []);

  async function lookupCustomer() {
    if (!customerPhone.trim()) {
      toast.message("Enter a phone number to look up.");
      return;
    }
    setLookingUp(true);
    try {
      const result = await lookupCustomerByPhoneAction(customerPhone);
      if (!result.success) {
        toast.error(result.message);
        return;
      }
      if (result.found) {
        if (saleMode === "CREDIT" && !result.customer.allowCredit) {
          toast.error(
            "This customer is not enabled for credit. Choose an eligible credit customer.",
          );
          return;
        }
        setCustomerId(result.customer.id);
        setCustomerLabel(result.customer.displayName);
        setCustomerContactName(
          (result.customer as { contactName?: string | null }).contactName ??
            null,
        );
        setCustomerName(
          (result.customer as { contactName?: string | null }).contactName ||
            result.customer.displayName,
        );
        setCustomerPhone(result.customer.phone ?? customerPhone);
        setCustomerPoints(result.customer.loyaltyPoints ?? 0);
        setPosCustomers((current) =>
          current.some((customer) => customer.id === result.customer.id)
            ? current
            : [
                {
                  id: result.customer.id,
                  displayName: result.customer.displayName,
                  contactName:
                    (result.customer as { contactName?: string | null })
                      .contactName ?? null,
                  phone: result.customer.phone ?? null,
                  allowCredit: result.customer.allowCredit,
                  creditLimit: result.customer.creditLimit,
                  loyaltyPoints: result.customer.loyaltyPoints ?? 0,
                  isBusiness: result.customer.customerType === "BUSINESS",
                },
                ...current,
              ],
        );
        toast.success(
          `Member: ${result.customer.displayName} · ${result.customer.loyaltyPoints ?? 0} pts`,
        );
      } else {
        setCustomerId(null);
        setCustomerLabel(null);
        setCustomerPoints(null);
        toast.message(result.message);
      }
    } finally {
      setLookingUp(false);
    }
  }

  function clearCustomer() {
    setCustomerId(null);
    setCustomerLabel(null);
    setCustomerPhone("");
    setCustomerName("");
    setCustomerPoints(null);
    setEarnPreview(null);
  }

  function openCustomerDialog(mode: "select" | "create" = "select") {
    setCustomerDialogMode(mode);
    if (mode === "create") {
      setNewCustomer((current) => ({
        ...current,
        firstName: current.firstName || customerName,
        phone: current.phone || customerPhone,
      }));
    }
    setCustomerDialogOpen(true);
  }

  async function createPosCustomer() {
    setCustomerSaving(true);
    try {
      const allowCredit = saleMode === "CREDIT";
      const isBusiness = newCustomer.customerType === "BUSINESS";
      const result = await createCustomerAction({
        customerType: newCustomer.customerType,
        firstName: newCustomer.firstName,
        lastName: newCustomer.lastName || null,
        companyName: isBusiness ? newCustomer.companyName : null,
        tradingName: isBusiness ? newCustomer.tradingName || null : null,
        registrationNumber: isBusiness
          ? newCustomer.registrationNumber || null
          : null,
        taxPin: isBusiness ? newCustomer.taxPin || null : null,
        phone: newCustomer.phone,
        idNumber: isBusiness
          ? newCustomer.idNumber || null
          : newCustomer.idNumber,
        address: newCustomer.address,
        emergencyContact: isBusiness
          ? newCustomer.emergencyContact || null
          : newCustomer.emergencyContact,
        emergencyPhone: isBusiness
          ? newCustomer.emergencyPhone || null
          : newCustomer.emergencyPhone,
        allowCredit,
        creditLimit: allowCredit ? newCustomer.creditLimit : 0,
      });
      if (!result.success) {
        toast.error(result.message);
        return;
      }

      const [lookup, refreshedCustomers] = await Promise.all([
        lookupCustomerByPhoneAction(newCustomer.phone),
        listPosCustomersAction(),
      ]);
      if (!lookup.success || !lookup.found) {
        toast.error(
          "Customer was created, but could not be selected. Find them by phone in the customer picker.",
        );
        if (refreshedCustomers.success)
          setPosCustomers(refreshedCustomers.customers);
        return;
      }

      if (refreshedCustomers.success) {
        setPosCustomers(refreshedCustomers.customers);
      }
      setCustomerId(lookup.customer.id);
      setCustomerLabel(lookup.customer.displayName);
      setCustomerContactName(lookup.customer.contactName ?? null);
      setCustomerPhone(lookup.customer.phone ?? newCustomer.phone);
      setCustomerName(
        lookup.customer.contactName || lookup.customer.displayName,
      );
      setCustomerPoints(lookup.customer.loyaltyPoints ?? 0);
      setCustomerDialogOpen(false);
      if (saleMode === "CREDIT") setCheckoutOpen(true);
      toast.success(result.message);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not create customer.",
      );
    } finally {
      setCustomerSaving(false);
    }
  }

  return {
    customerDialogOpen,
    setCustomerDialogOpen,
    customerDialogMode,
    setCustomerDialogMode,
    customerSaving,
    setCustomerSaving,
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
    earnPreview,
    setEarnPreview,
    lookingUp,
    setLookingUp,
    lookupCustomer,
    clearCustomer,
    openCustomerDialog,
    createPosCustomer,
  };
}
