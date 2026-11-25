import type { Metadata } from "next";

import { PricingPage } from "@/features/marketing/components/pricing-page";

export const metadata: Metadata = {
  title: "Pricing · GetAxe",
  description:
    "GetAxe plans for Kenyan shops: Starter, Business, Pharmacy and Growth. POS, stock, credit and profit in one system.",
};

export default function Page() {
  return <PricingPage />;
}
