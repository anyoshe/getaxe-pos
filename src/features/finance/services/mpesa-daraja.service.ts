/**
 * Safaricom Daraja Lipa Na M-Pesa Online (STK Push).
 * Per-business credentials from mpesa_settings.
 * simulationMode: no external call — for pilots without API keys.
 */

export type MpesaEnv = "sandbox" | "production";

export type MpesaConfig = {
  environment: MpesaEnv;
  consumerKey: string;
  consumerSecret: string;
  passkey: string;
  shortcode: string;
  shortcodeType: "TILL" | "PAYBILL";
  accountReference?: string | null;
  transactionDesc?: string | null;
  simulationMode?: boolean;
};

function baseUrl(env: MpesaEnv) {
  return env === "production"
    ? "https://api.safaricom.co.ke"
    : "https://sandbox.safaricom.co.ke";
}

/** Kenya MSISDN → 2547XXXXXXXX */
export function normalizeMpesaPhone(raw: string): string | null {
  const d = raw.replace(/\D/g, "");
  if (d.length === 9 && d.startsWith("7")) return `254${d}`;
  if (d.length === 10 && d.startsWith("07")) return `254${d.slice(1)}`;
  if (d.length === 12 && d.startsWith("254")) return d;
  if (d.length === 13 && d.startsWith("254")) return d.slice(0, 12);
  return null;
}

function timestamp() {
  const n = new Date();
  const p = (x: number) => String(x).padStart(2, "0");
  return (
    `${n.getFullYear()}${p(n.getMonth() + 1)}${p(n.getDate())}` +
    `${p(n.getHours())}${p(n.getMinutes())}${p(n.getSeconds())}`
  );
}

function password(shortcode: string, passkey: string, ts: string) {
  return Buffer.from(`${shortcode}${passkey}${ts}`).toString("base64");
}

export async function getDarajaToken(cfg: MpesaConfig): Promise<string> {
  const auth = Buffer.from(
    `${cfg.consumerKey}:${cfg.consumerSecret}`,
  ).toString("base64");
  const res = await fetch(
    `${baseUrl(cfg.environment)}/oauth/v1/generate?grant_type=client_credentials`,
    {
      headers: { Authorization: `Basic ${auth}` },
      cache: "no-store",
    },
  );
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`M-Pesa auth failed (${res.status}): ${body.slice(0, 200)}`);
  }
  const data = (await res.json()) as { access_token?: string };
  if (!data.access_token) throw new Error("M-Pesa auth: no access_token");
  return data.access_token;
}

export type StkPushResult = {
  checkoutRequestId: string;
  merchantRequestId: string;
  customerMessage?: string;
  simulated?: boolean;
};

export async function stkPush(
  cfg: MpesaConfig,
  input: {
    phone: string;
    amount: number;
    callbackUrl: string;
    accountReference?: string;
  },
): Promise<StkPushResult> {
  const phone = normalizeMpesaPhone(input.phone);
  if (!phone) throw new Error("Invalid M-Pesa phone. Use 07XXXXXXXX or 2547XXXXXXXX.");
  const amount = Math.round(Number(input.amount));
  if (!Number.isFinite(amount) || amount < 1) {
    throw new Error("Amount must be at least KES 1.");
  }

  if (cfg.simulationMode || !cfg.consumerKey || !cfg.consumerSecret || !cfg.passkey) {
    const id = `SIM${Date.now()}${Math.floor(Math.random() * 999)}`;
    return {
      checkoutRequestId: id,
      merchantRequestId: `M${id}`,
      customerMessage: "Simulation: STK accepted (no real Daraja call).",
      simulated: true,
    };
  }

  if (!cfg.shortcode) throw new Error("M-Pesa shortcode (Till / Paybill) is not set.");

  const token = await getDarajaToken(cfg);
  const ts = timestamp();
  const isTill = (cfg.shortcodeType || "TILL").toUpperCase() === "TILL";
  const body = {
    BusinessShortCode: cfg.shortcode,
    Password: password(cfg.shortcode, cfg.passkey, ts),
    Timestamp: ts,
    TransactionType: isTill
      ? "CustomerBuyGoodsOnline"
      : "CustomerPayBillOnline",
    Amount: amount,
    PartyA: phone,
    PartyB: cfg.shortcode,
    PhoneNumber: phone,
    CallBackURL: input.callbackUrl,
    AccountReference: (input.accountReference || cfg.accountReference || "GetAxe").slice(0, 12),
    TransactionDesc: (cfg.transactionDesc || "POS Sale").slice(0, 13),
  };

  const res = await fetch(
    `${baseUrl(cfg.environment)}/mpesa/stkpush/v1/processrequest`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
      cache: "no-store",
    },
  );
  const data = (await res.json()) as {
    ResponseCode?: string;
    ResponseDescription?: string;
    CustomerMessage?: string;
    CheckoutRequestID?: string;
    MerchantRequestID?: string;
    errorMessage?: string;
    errorCode?: string;
  };
  if (!res.ok || data.ResponseCode !== "0") {
    throw new Error(
      data.errorMessage ||
        data.ResponseDescription ||
        data.CustomerMessage ||
        `STK push failed (${res.status})`,
    );
  }
  if (!data.CheckoutRequestID) throw new Error("STK push: missing CheckoutRequestID");
  return {
    checkoutRequestId: data.CheckoutRequestID,
    merchantRequestId: data.MerchantRequestID || "",
    customerMessage: data.CustomerMessage,
  };
}

export type StkQueryResult = {
  status: "PENDING" | "SUCCESS" | "FAILED" | "CANCELLED";
  resultCode?: string;
  resultDesc?: string;
  mpesaReceipt?: string;
};

export async function stkQuery(
  cfg: MpesaConfig,
  checkoutRequestId: string,
): Promise<StkQueryResult> {
  if (
    cfg.simulationMode ||
    !cfg.consumerKey ||
    checkoutRequestId.startsWith("SIM")
  ) {
    // Auto-succeed simulation after first poll
    const receipt = `SIM${checkoutRequestId.replace(/\D/g, "").slice(-8)}`;
    return {
      status: "SUCCESS",
      resultCode: "0",
      resultDesc: "Simulation success",
      mpesaReceipt: receipt,
    };
  }

  const token = await getDarajaToken(cfg);
  const ts = timestamp();
  const res = await fetch(
    `${baseUrl(cfg.environment)}/mpesa/stkpushquery/v1/query`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        BusinessShortCode: cfg.shortcode,
        Password: password(cfg.shortcode!, cfg.passkey!, ts),
        Timestamp: ts,
        CheckoutRequestID: checkoutRequestId,
      }),
      cache: "no-store",
    },
  );
  const data = (await res.json()) as {
    ResultCode?: string | number;
    ResultDesc?: string;
    errorMessage?: string;
  };
  const code = String(data.ResultCode ?? "");
  if (code === "0") {
    return {
      status: "SUCCESS",
      resultCode: code,
      resultDesc: data.ResultDesc,
      // Receipt often only on callback; query may not include it
    };
  }
  // 1032 user cancelled, 1037 timeout, 4999 still processing-ish
  if (code === "1032") {
    return { status: "CANCELLED", resultCode: code, resultDesc: data.ResultDesc };
  }
  if (code === "1" || code === "1037" || data.errorMessage?.includes("being processed")) {
    return { status: "PENDING", resultCode: code, resultDesc: data.ResultDesc || data.errorMessage };
  }
  if (!res.ok && !code) {
    return { status: "PENDING", resultDesc: data.errorMessage || "Query pending" };
  }
  return {
    status: "FAILED",
    resultCode: code,
    resultDesc: data.ResultDesc || data.errorMessage || "Payment failed",
  };
}
