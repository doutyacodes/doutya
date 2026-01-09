import { NextResponse } from "next/server";
import { razorpay } from "@/lib/razorpay";

export async function POST(req) {
  const { plan_type } = await req.json();

  try {
    const amount = plan_type === "base" ? 9900 : 19900; // paise

    const order = await razorpay.orders.create({
      amount,
      currency: "INR",
      receipt: "order_" + Date.now(),
    });

    return NextResponse.json({ order });
  } catch (err) {
    console.error("Order error:", err);
    return NextResponse.json(
      { message: "Failed to create order" },
      { status: 500 }
    );
  }
}
