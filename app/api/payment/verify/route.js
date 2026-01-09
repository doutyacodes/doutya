import { NextResponse } from "next/server";
import crypto from "crypto";
import { authenticate } from "@/lib/jwtMiddleware";
import { db } from "@/utils";
import { USER_DETAILS } from "@/utils/schema";
import { eq } from "drizzle-orm";
import jwt from "jsonwebtoken";

export async function POST(req) {
  const authResult = await authenticate(req);
  if (!authResult.authenticated) return authResult.response;

  const userId = authResult.decoded_Data.userId;

  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    plan_type,
  } = await req.json();

  // STEP 1: VERIFY SIGNATURE
  const body = razorpay_order_id + "|" + razorpay_payment_id;

  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(body.toString())
    .digest("hex");

  if (expectedSignature !== razorpay_signature) {
    return NextResponse.json(
      { message: "Invalid payment signature!" },
      { status: 400 }
    );
  }

  // STEP 2: UPDATE USER PLAN
  await db
    .update(USER_DETAILS)
    .set({ plan_type })
    .where(eq(USER_DETAILS.id, userId))
    .execute();

  // STEP 3: GENERATE NEW TOKEN
  const token = jwt.sign(
    {
      userId,
      plan: plan_type,
      birth_date: authResult.decoded_Data.birth_date,
      isVerified: authResult.decoded_Data.isVerified,
    },
    process.env.JWT_SECRET_KEY
  );

  const res = NextResponse.json({
    message: "Payment verified & plan activated",
    plan_type,
    token,
  });

  // STEP 4: SET AUTH COOKIE
  res.cookies.set("auth_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
  });

  return res;
}
