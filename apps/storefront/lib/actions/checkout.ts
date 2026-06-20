"use server";

import { generateButtonConfig } from "@/lib/bold";

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
