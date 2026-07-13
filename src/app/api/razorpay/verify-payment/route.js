import { NextResponse } from "next/server";
import crypto from "crypto";
import Razorpay from "razorpay";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL;

const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabaseServiceRoleKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY;

const razorpayKeyId =
  process.env.RAZORPAY_KEY_ID;

const razorpayKeySecret =
  process.env.RAZORPAY_KEY_SECRET;

const plans = {
  monthly: {
    amount: 99,
    days: 30,
  },
  quarterly: {
    amount: 249,
    days: 90,
  },
  yearly: {
    amount: 799,
    days: 365,
  },
};

function getAccessToken(request) {
  const authorization =
    request.headers.get("authorization");

  if (!authorization?.startsWith("Bearer ")) {
    return "";
  }

  return authorization
    .replace("Bearer ", "")
    .trim();
}

function createAuthClient(accessToken) {
  return createClient(
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
}

function signaturesMatch({
  orderId,
  paymentId,
  receivedSignature,
}) {
  const generatedSignature = crypto
    .createHmac("sha256", razorpayKeySecret)
    .update(`${orderId}|${paymentId}`)
    .digest("hex");

  const generatedBuffer = Buffer.from(
    generatedSignature,
    "utf8"
  );

  const receivedBuffer = Buffer.from(
    receivedSignature,
    "utf8"
  );

  if (
    generatedBuffer.length !== receivedBuffer.length
  ) {
    return false;
  }

  return crypto.timingSafeEqual(
    generatedBuffer,
    receivedBuffer
  );
}

function calculateExpiryDate({
  startingDate,
  durationDays,
}) {
  const expiry = new Date(startingDate);

  expiry.setDate(
    expiry.getDate() + durationDays
  );

  return expiry.toISOString();
}

export async function POST(request) {
  try {
    if (
      !supabaseUrl ||
      !supabaseAnonKey ||
      !supabaseServiceRoleKey ||
      !razorpayKeyId ||
      !razorpayKeySecret
    ) {
      return NextResponse.json(
        {
          error:
            "Payment verification configuration is incomplete.",
        },
        { status: 500 }
      );
    }

    const accessToken = getAccessToken(request);

    if (!accessToken) {
      return NextResponse.json(
        { error: "Login is required." },
        { status: 401 }
      );
    }

    const authClient =
      createAuthClient(accessToken);

    const {
      data: { user },
      error: userError,
    } = await authClient.auth.getUser(
      accessToken
    );

    if (userError || !user) {
      return NextResponse.json(
        {
          error:
            "Your login session is invalid or expired.",
        },
        { status: 401 }
      );
    }

    const body = await request.json();

    const razorpayOrderId =
      body?.razorpay_order_id;

    const razorpayPaymentId =
      body?.razorpay_payment_id;

    const razorpaySignature =
      body?.razorpay_signature;

    if (
      !razorpayOrderId ||
      !razorpayPaymentId ||
      !razorpaySignature
    ) {
      return NextResponse.json(
        {
          error:
            "Missing Razorpay payment information.",
        },
        { status: 400 }
      );
    }

    const signatureValid = signaturesMatch({
      orderId: razorpayOrderId,
      paymentId: razorpayPaymentId,
      receivedSignature: razorpaySignature,
    });

    if (!signatureValid) {
      return NextResponse.json(
        {
          error:
            "Payment signature verification failed.",
        },
        { status: 400 }
      );
    }

    const razorpay = new Razorpay({
      key_id: razorpayKeyId,
      key_secret: razorpayKeySecret,
    });

    const [order, payment] =
      await Promise.all([
        razorpay.orders.fetch(
          razorpayOrderId
        ),

        razorpay.payments.fetch(
          razorpayPaymentId
        ),
      ]);

    if (!order || !payment) {
      return NextResponse.json(
        {
          error:
            "Unable to confirm the Razorpay transaction.",
        },
        { status: 400 }
      );
    }

    const orderPlan =
      order.notes?.plan;

    const orderUserId =
      order.notes?.user_id;

    const selectedPlan =
      plans[orderPlan];

    if (!selectedPlan) {
      return NextResponse.json(
        {
          error:
            "The subscription plan attached to this order is invalid.",
        },
        { status: 400 }
      );
    }

    if (orderUserId !== user.id) {
      return NextResponse.json(
        {
          error:
            "This payment order does not belong to the logged-in user.",
        },
        { status: 403 }
      );
    }

    const expectedAmount =
      selectedPlan.amount * 100;

    if (
      Number(order.amount) !== expectedAmount ||
      Number(payment.amount) !== expectedAmount
    ) {
      return NextResponse.json(
        {
          error:
            "The verified payment amount does not match the selected plan.",
        },
        { status: 400 }
      );
    }

    if (
      order.currency !== "INR" ||
      payment.currency !== "INR"
    ) {
      return NextResponse.json(
        {
          error:
            "Unexpected payment currency.",
        },
        { status: 400 }
      );
    }

    if (
      payment.order_id !== razorpayOrderId
    ) {
      return NextResponse.json(
        {
          error:
            "The payment does not belong to this Razorpay order.",
        },
        { status: 400 }
      );
    }

    if (payment.status !== "captured") {
      return NextResponse.json(
        {
          error:
            "Payment has not been captured yet. Premium access was not activated.",
        },
        { status: 409 }
      );
    }

    const supabaseAdmin = createClient(
      supabaseUrl,
      supabaseServiceRoleKey,
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
          detectSessionInUrl: false,
        },
      }
    );

    const {
      data: existingPaymentSubscription,
      error: duplicateCheckError,
    } = await supabaseAdmin
      .from("user_subscriptions")
      .select(
        "id, plan, status, expiry_date, razorpay_payment_id"
      )
      .eq(
        "razorpay_payment_id",
        razorpayPaymentId
      )
      .maybeSingle();

    if (duplicateCheckError) {
      return NextResponse.json(
        {
          error:
            duplicateCheckError.message,
        },
        { status: 500 }
      );
    }

    if (existingPaymentSubscription) {
      return NextResponse.json({
        success: true,
        alreadyProcessed: true,
        message:
          "This payment was already verified.",
        subscription:
          existingPaymentSubscription,
      });
    }

    const now = new Date();

    const {
      data: currentSubscription,
      error: currentSubscriptionError,
    } = await supabaseAdmin
      .from("user_subscriptions")
      .select("id, expiry_date")
      .eq("user_id", user.id)
      .eq("status", "active")
      .gte(
        "expiry_date",
        now.toISOString()
      )
      .order("expiry_date", {
        ascending: false,
      })
      .limit(1)
      .maybeSingle();

    if (currentSubscriptionError) {
      return NextResponse.json(
        {
          error:
            currentSubscriptionError.message,
        },
        { status: 500 }
      );
    }

    let subscriptionStart = now;

    if (
      currentSubscription?.expiry_date &&
      new Date(
        currentSubscription.expiry_date
      ) > now
    ) {
      subscriptionStart = new Date(
        currentSubscription.expiry_date
      );
    }

    const expiryDate = calculateExpiryDate({
      startingDate: subscriptionStart,
      durationDays: selectedPlan.days,
    });

    const {
      data: newSubscription,
      error: subscriptionInsertError,
    } = await supabaseAdmin
      .from("user_subscriptions")
      .insert([
        {
          user_id: user.id,
          plan: orderPlan,
          status: "active",
          amount: selectedPlan.amount,
          razorpay_order_id:
            razorpayOrderId,
          razorpay_payment_id:
            razorpayPaymentId,
          razorpay_signature:
            razorpaySignature,
          start_date: now.toISOString(),
          expiry_date: expiryDate,
        },
      ])
      .select()
      .single();

    if (subscriptionInsertError) {
      return NextResponse.json(
        {
          error:
            subscriptionInsertError.message,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message:
        "Payment verified and premium membership activated.",
      subscription: {
        id: newSubscription.id,
        plan: newSubscription.plan,
        status: newSubscription.status,
        startDate:
          newSubscription.start_date,
        expiryDate:
          newSubscription.expiry_date,
      },
    });
  } catch (error) {
    console.error(
      "Payment verification error:",
      error
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Payment verification failed.",
      },
      { status: 500 }
    );
  }
}