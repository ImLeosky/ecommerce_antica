import { createHash, createHmac } from "node:crypto";
import { supabase } from "./supabaseClient";

const BOLD_API_BASE = "https://integrations.api.bold.co";

type BoldCredentials = {
  identityKey: string;
  secretKey: string;
};

let _boldEnv: string = "prod";

async function getCredentials(): Promise<BoldCredentials> {
  const { data: config } = await supabase
    .from("admin_config")
    .select("value")
    .eq("key", "test_mode_enabled")
    .single();

  const isTest = !!config?.value?.enabled;
  _boldEnv = isTest ? "test" : "prod";

  if (isTest) {
    return {
      identityKey: process.env.BOLD_ID_TEST!,
      secretKey: process.env.BOLD_SECRET_TEST!,
    };
  }

  return {
    identityKey: process.env.BOLD_ID_PROD!,
    secretKey: process.env.BOLD_SECRET_PROD!,
  };
}

function getBoldEnv(): string {
  return _boldEnv;
}

export type BoldButtonConfig = {
  orderId: string;
  currency: string;
  amount: string;
  apiKey: string;
  integritySignature: string;
  description: string;
  redirectionUrl: string;
  renderMode: 'redirect' | 'embedded';
  customerData: string;
  tax?: string;
  originUrl?: string;
  expirationDate?: number;
};

export async function generateButtonConfig(
  locale: string,
  orderId: string,
  totalAmount: number,
  email: string,
  name: string,
  phone: string
): Promise<BoldButtonConfig> {
  const creds = await getCredentials();
  const amount = Math.round(totalAmount) * 1000;
  const hashStr = `${orderId}${amount}COP${creds.secretKey}`;
  const integritySignature = createHash("sha256").update(hashStr).digest("hex");
  return {
    orderId,
    currency: "COP",
    amount: String(amount),
    apiKey: creds.identityKey,
    integritySignature,
    description: `Pedido Antica #${String(orderId).slice(0, 8).toUpperCase()}`,
    redirectionUrl: `https://anticamm.com/${locale}/checkout/success`,
    renderMode: 'redirect',
    customerData: JSON.stringify({
      email,
      fullName: name,
      phone,
    }),
  };
}

export async function getBoldCredentials(): Promise<BoldCredentials> {
  return getCredentials();
}

export interface CreatePaymentLinkParams {
  orderId: string;
  totalAmount: number;
  currency?: string;
  description?: string;
  callbackUrl: string;
  payerEmail?: string;
}

export interface PaymentLinkResponse {
  payment_link: string;
  url: string;
}

export async function createPaymentLink(
  params: CreatePaymentLinkParams
): Promise<PaymentLinkResponse> {
  const creds = await getCredentials();

  const body = {
    amount: {
      currency: params.currency || "COP",
      total_amount: Math.round(params.totalAmount) * 1000,
    },
    description:
      params.description || `Pedido Antica #${params.orderId.slice(0, 8).toUpperCase()}`,
    callback_url: params.callbackUrl,
    payer_email: params.payerEmail,
    amount_type: "CLOSE",
  };

  const res = await fetch(`${BOLD_API_BASE}/online/link/v1`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `x-api-key ${creds.identityKey}`,
    },
    body: JSON.stringify(body),
  });

  const json = await res.json();

  if (!res.ok) {
    const errMsg = json.errors?.[0]?.message || JSON.stringify(json);
    console.error("Bold API error:", json);
    throw new Error(`Bold[${getBoldEnv()}] key=${creds.identityKey.slice(0, 8)}...: ${errMsg}`);
  }

  return {
    payment_link: json.payload.payment_link,
    url: json.payload.url,
  };
}

export async function getPaymentStatus(
  paymentLinkId: string
): Promise<string> {
  const creds = await getCredentials();

  const res = await fetch(`${BOLD_API_BASE}/online/link/v1/${paymentLinkId}`, {
    headers: {
      Authorization: `x-api-key ${creds.identityKey}`,
    },
  });

  const json = await res.json();

  if (!res.ok) {
    console.error("Bold API error fetching status:", json);
    throw new Error("Error al consultar estado del pago en Bold");
  }

  return json.payload?.status || "UNKNOWN";
}

export function verifyWebhookSignature(
  body: string,
  signature: string
): boolean {
  const secrets = [
    process.env.BOLD_SECRET_PROD || "",
    process.env.BOLD_SECRET_TEST || "",
    "",
  ];

  const base64Body = Buffer.from(body).toString("base64");

  return secrets.some((secret) => {
    const expected = createHmac("sha256", secret)
      .update(base64Body)
      .digest("hex");
    return expected === signature;
  });
}
