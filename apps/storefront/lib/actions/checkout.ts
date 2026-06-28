"use server";

import { generateButtonConfig } from "@/lib/bold";
import { sendOrderConfirmation } from "@/lib/email";

export async function processCheckout(
  locale: string,
  orderId: string,
  totalAmount: number,
  email: string,
  name: string,
  phone: string
) {
  const config = await generateButtonConfig(
    locale,
    orderId,
    totalAmount,
    email,
    name,
    phone
  );

  return config;
}

export async function sendConfirmationEmail(orderId: string) {
  await sendOrderConfirmation(orderId);
}
