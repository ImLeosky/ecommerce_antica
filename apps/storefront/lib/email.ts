import { Resend } from "resend";
import { createClient } from "@supabase/supabase-js";

const resendApiKey = process.env.RESEND_API_KEY;
const fromEmail = process.env.EMAIL_FROM || "Antíca <noreply@anticamm.com>";

function getResend() {
  if (!resendApiKey) {
    console.warn("RESEND_API_KEY not configured — email not sent");
    return null;
  }
  return new Resend(resendApiKey);
}

interface OrderItem {
  name: Record<string, string> | string;
  price: number;
  quantity: number;
  image_url?: string;
  is_gift?: boolean;
  recipient_name?: string;
  voucher_value?: number;
}

interface OrderData {
  id: string;
  customer_name: string;
  customer_email: string;
  customer_address?: string;
  total_amount: number;
  payment_method?: string;
  items: OrderItem[];
  currency?: string;
  confirmation_email_sent?: boolean;
}

function renderItemsRows(items: OrderItem[], locale = "es"): string {
  return items
    .map(
      (item) => {
        const name = typeof item.name === "object" ? (item.name as Record<string, string>)[locale] || "" : item.name;
        const isGift = item.is_gift;
        const giftLabel = isGift
          ? `<br><span style="color: #cba87c; font-size: 11px;">🎁 Regalo para ${item.recipient_name || ""}</span>`
          : "";

        return `
          <tr>
            <td style="padding: 12px 0; border-bottom: 1px solid #eee;">
              <table cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding-right: 12px;">
                    <div style="width: 48px; height: 48px; background-color: #f5f3ef; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 20px;">🛍️</div>
                  </td>
                  <td>
                    <span style="color: #1a1512; font-size: 14px; font-weight: 600;">${name}</span>
                    <span style="color: #999; font-size: 13px;"> x ${item.quantity}</span>
                    ${giftLabel}
                  </td>
                  <td style="text-align: right;">
                    <span style="color: #1a1512; font-size: 14px; font-weight: 600;">$ ${item.price * item.quantity}</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>`;
      },
    )
    .join("");
}

const defaultPlaceholders = {
  customer_name: "",
  order_id: "",
  total_amount: "0",
  currency: "COP",
  payment_method: "Pago en línea",
  customer_address: "",
  items_rows: "",
};

function fillTemplate(template: string, data: Record<string, string>): string {
  let result = template;
  for (const [key, value] of Object.entries(data)) {
    result = result.replace(new RegExp(`{{${key}}}`, "g"), value);
  }
  return result;
}

export async function sendOrderConfirmation(orderId: string): Promise<void> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  const [orderResult, templateResult] = await Promise.all([
    supabase.from("orders").select("*").eq("id", orderId).single(),
    supabase.from("email_templates").select("*").eq("key", "order_confirmation").single(),
  ]);

  if (orderResult.error) {
    console.error("Error fetching order for email:", orderResult.error);
    return;
  }

  const order = orderResult.data as OrderData;

  if (!order.customer_email) {
    console.warn("Order has no customer email — skipping confirmation email");
    return;
  }

  if (order.confirmation_email_sent) {
    console.log("Confirmation email already sent for order", orderId);
    return;
  }

  const currency = order.currency || "COP";
  const paymentMethodMap: Record<string, string> = {
    CARD: "Tarjeta de crédito/débito",
    PSE: "PSE",
    NEQUI: "Nequi",
    BOTON_BANCOLOMBIA: "Botón Bancolombia",
    QR: "Código QR",
  };
  const paymentMethod = paymentMethodMap[order.payment_method || ""] || order.payment_method || "Pago en línea";

  const itemsRows = renderItemsRows(order.items || []);

  if (templateResult.error || !templateResult.data) {
    console.warn("No email template found — using fallback");
    const resend = getResend();
    if (!resend) return;

    const { error: sendError } = await resend.emails.send({
      from: fromEmail,
      to: order.customer_email,
      subject: `¡Gracias por tu compra, ${order.customer_name}!`,
      html: `<h2>¡Gracias por tu compra, ${order.customer_name}!</h2>
<p>Tu pedido <strong>#${order.id}</strong> ha sido procesado.</p>
<p>Total: $${order.total_amount} ${currency}</p>`,
    });

    if (!sendError) {
      await supabase.from("orders").update({ confirmation_email_sent: true }).eq("id", orderId);
    }
    return;
  }

  const template = templateResult.data;

  const subject = fillTemplate(template.subject, {
    ...defaultPlaceholders,
    customer_name: order.customer_name,
    order_id: order.id.slice(0, 8),
  });

  const html = fillTemplate(template.body_html, {
    ...defaultPlaceholders,
    customer_name: order.customer_name,
    order_id: order.id.slice(0, 8),
    total_amount: String(order.total_amount),
    currency,
    payment_method: paymentMethod,
    customer_address: order.customer_address || "",
    items_rows: itemsRows,
  });

  const resend = getResend();
  if (!resend) return;

  const { error: sendError } = await resend.emails.send({
    from: fromEmail,
    to: order.customer_email,
    subject,
    html,
  });

  if (sendError) {
    console.error("Error sending confirmation email:", sendError);
  } else {
    await supabase.from("orders").update({ confirmation_email_sent: true }).eq("id", orderId);
  }
}
