import { NextResponse } from "next/server";
import { razorpay } from "@/lib/razorpay";

export async function POST(req) {
  try {
    const { plan_type } = await req.json();
    const amount = plan_type === "base" ? 9900 : 19900; // paise

    const isPlaceholderKey =
      !process.env.RAZORPAY_KEY_ID ||
      process.env.RAZORPAY_KEY_ID === "rzp_test_placeholder";

    if (isPlaceholderKey || process.env.NEXT_PUBLIC_MOCK_PAYMENT === "true") {
      const mockOrder = {
        id: "mock_order_" + Date.now(),
        amount,
        currency: "INR",
        receipt: "order_" + Date.now(),
        status: "created"
      };
      return NextResponse.json({ order: mockOrder });
    }

    try {
      const order = await razorpay.orders.create({
        amount,
        currency: "INR",
        receipt: "order_" + Date.now(),
      });
      return NextResponse.json({ order });
    } catch (orderErr) {
      console.warn("Razorpay API order error, falling back to mock order for dev:", orderErr?.message);
      if (process.env.NODE_ENV !== "production") {
        return NextResponse.json({
          order: {
            id: "mock_order_" + Date.now(),
            amount,
            currency: "INR",
            receipt: "order_" + Date.now(),
            status: "created"
          }
        });
      }
      throw orderErr;
    }
  } catch (err) {
    console.error("Order error:", err);
    return NextResponse.json(
      { message: "Failed to create order" },
      { status: 500 }
    );
  }
}
