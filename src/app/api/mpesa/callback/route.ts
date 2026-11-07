import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

import { db } from "@/db";
import { mpesaStkRequests } from "@/db/schema/integrations/mpesa";

/**
 * Safaricom Daraja STK callback.
 * Body shape (simplified):
 * { Body: { stkCallback: { CheckoutRequestID, ResultCode, ResultDesc, CallbackMetadata? } } }
 */
export async function POST(req: Request) {
  try {
    const json = (await req.json()) as {
      Body?: {
        stkCallback?: {
          CheckoutRequestID?: string;
          MerchantRequestID?: string;
          ResultCode?: number | string;
          ResultDesc?: string;
          CallbackMetadata?: {
            Item?: Array<{ Name?: string; Value?: string | number }>;
          };
        };
      };
    };
    const cb = json.Body?.stkCallback;
    if (!cb?.CheckoutRequestID) {
      return NextResponse.json({ ResultCode: 0, ResultDesc: "Accepted" });
    }

    const code = String(cb.ResultCode ?? "");
    let receipt: string | null = null;
    const items = cb.CallbackMetadata?.Item || [];
    for (const it of items) {
      if (it.Name === "MpesaReceiptNumber" && it.Value != null) {
        receipt = String(it.Value);
      }
    }

    const status =
      code === "0" ? "SUCCESS" : code === "1032" ? "CANCELLED" : "FAILED";

    await db
      .update(mpesaStkRequests)
      .set({
        status,
        resultCode: code,
        resultDesc: cb.ResultDesc || null,
        mpesaReceipt: receipt,
        merchantRequestId: cb.MerchantRequestID || undefined,
        updatedAt: new Date(),
      })
      .where(eq(mpesaStkRequests.checkoutRequestId, cb.CheckoutRequestID));

    return NextResponse.json({ ResultCode: 0, ResultDesc: "Accepted" });
  } catch {
    // Always 200 to Safaricom
    return NextResponse.json({ ResultCode: 0, ResultDesc: "Accepted" });
  }
}
