import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createHmac } from "node:crypto";
import { sendOrderConfirmation } from "@/lib/email";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

function verifySignature(body: string, signature: string): boolean {
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

export async function POST(request: NextRequest) {
  try {
    const signature = request.headers.get("x-bold-signature") || "";
    const rawBody = await request.text();

    if (signature && !verifySignature(rawBody, signature)) {
      console.error("Bold webhook: invalid signature");
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const payload = JSON.parse(rawBody);
    const eventType = payload.type;
    const data = payload.data || {};

    const orderReference =
      data.metadata?.reference ||
      data.reference ||
      payload.subject;

    if (!orderReference) {
      console.warn("Bold webhook: missing order reference", payload);
      return NextResponse.json({ received: true });
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    let newStatus: string | null = null;
    let boldStatus: string | null = null;
    let boldTransactionId: string | null = null;
    let paymentMethod: string | null = null;

    switch (eventType) {
      case "SALE_APPROVED":
        newStatus = "completed";
        boldStatus = "paid";
        boldTransactionId = data.payment_id || data.transaction_id || null;
        paymentMethod = data.payment_method || null;
        break;

      case "SALE_REJECTED":
        newStatus = "cancelled";
        boldStatus = "rejected";
        boldTransactionId = data.payment_id || null;
        break;

      case "VOID_APPROVED":
        boldStatus = "voided";
        newStatus = "cancelled";
        break;

      case "VOID_REJECTED":
        boldStatus = "void_rejected";
        break;

      default:
        console.log("Bold webhook: unknown event type", eventType);
        break;
    }

    const updateData: Record<string, unknown> = {};

    if (newStatus) updateData.status = newStatus;
    if (boldStatus) updateData.bold_status = boldStatus;
    if (boldTransactionId) updateData.bold_transaction_id = boldTransactionId;
    if (paymentMethod) updateData.payment_method = paymentMethod;

    if (Object.keys(updateData).length > 0) {
      const { error } = await supabase
        .from("orders")
        .update(updateData)
        .eq("id", orderReference);

      if (error) {
        const { error: linkError } = await supabase
          .from("orders")
          .update(updateData)
          .eq("bold_payment_link_id", orderReference);

        if (linkError) {
          console.error("Bold webhook: error updating order", linkError);
        }
      }
    }

    if (eventType === "SALE_APPROVED") {
      sendOrderConfirmation(orderReference).catch((e) =>
        console.error("Webhook: error sending confirmation email:", e)
      );
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("Bold webhook error:", err);
    return NextResponse.json({ received: true }, { status: 200 });
  }
}

export const runtime = "nodejs";
