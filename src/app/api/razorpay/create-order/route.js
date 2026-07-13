import { NextResponse } from "next/server";
import Razorpay from "razorpay";
import { createClient } from "@supabase/supabase-js";

const plans = {
  monthly: {
    amount: 99,
    name: "Monthly Plan",
    days: 30,
  },
  quarterly: {
    amount: 249,
    name: "Quarterly Plan",
    days: 90,
  },
  yearly: {
    amount: 799,
    name: "Yearly Plan",
    days: 365,
  },
};

function getAccessToken(request) {
  const authorization = request.headers.get("authorization");

  if (!authorization?.startsWith("Bearer ")) {
    return "";
  }

  return authorization.replace("Bearer ", "").trim();
}

export async function GET() {
  return NextResponse.json({
    success: true,
    message: "Razorpay create-order route is active.",
  });
}

export async function POST(request) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey =
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const razorpayKeyId = process.env.RAZORPAY_KEY_ID;
    const razorpayKeySecret =
      process.env.RAZORPAY_KEY_SECRET;
    const publicRazorpayKey =
      process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ||
      razorpayKeyId;

    if (
      !supabaseUrl ||
      !supabaseAnonKey ||
      !razorpayKeyId ||
      !razorpayKeySecret ||
      !publicRazorpayKey
    ) {
      return NextResponse.json(
        {
          error:
            "Payment configuration is incomplete. Check .env.local.",
        },
        { status: 500 }
      );
    }

    const accessToken = getAccessToken(request);

    if (!accessToken) {
      return NextResponse.json(
        {
          error: "Please log in before subscribing.",
        },
        { status: 401 }
      );
    }

    const supabaseAuth = createClient(
      supabaseUrl,
      supabaseAnonKey,
      {
        global: {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
        auth: {
          persistSession: false,
          autoRefreshToken: false,
          detectSessionInUrl: false,
        },
      }
    );

    const {
      data: { user },
      error: userError,
    } = await supabaseAuth.auth.getUser(accessToken);

    if (userError || !user) {
      return NextResponse.json(
        {
          error:
            "Your login session is invalid or expired. Please log in again.",
        },
        { status: 401 }
      );
    }

    const body = await request.json();
    const planId = body?.plan;
    const selectedPlan = plans[planId];

    if (!selectedPlan) {
      return NextResponse.json(
        {
          error: "Invalid subscription plan selected.",
        },
        { status: 400 }
      );
    }

    const razorpay = new Razorpay({
      key_id: razorpayKeyId,
      key_secret: razorpayKeySecret,
    });

    const order = await razorpay.orders.create({
      amount: selectedPlan.amount * 100,
      currency: "INR",
      receipt: `aspire_${Date.now()}`,
      notes: {
        user_id: user.id,
        user_email: user.email || "",
        plan: planId,
        plan_name: selectedPlan.name,
        duration_days: String(selectedPlan.days),
      },
    });

    return NextResponse.json({
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      key: publicRazorpayKey,
      plan: {
        id: planId,
        name: selectedPlan.name,
        price: selectedPlan.amount,
        durationDays: selectedPlan.days,
      },
    });
  } catch (error) {
    console.error("Razorpay order creation error:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to create the Razorpay order.",
      },
      { status: 500 }
    );
  }
}