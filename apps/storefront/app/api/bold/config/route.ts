import { NextRequest, NextResponse } from "next/server";
import { generateButtonConfig } from "@/lib/bold";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { locale, orderId, totalAmount, email, name, phone } = body;

    if (!orderId || !totalAmount || !email) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const config = await generateButtonConfig(
      locale || "es",
      String(orderId),
      Number(totalAmount),
      email,
      name || "",
      phone || ""
    );

    return NextResponse.json({ config });
  } catch (error: any) {
    console.error("Bold config API error:", error);
    return NextResponse.json(
      { error: error.message || "Error generating bold config" },
      { status: 500 }
    );
  }
}
