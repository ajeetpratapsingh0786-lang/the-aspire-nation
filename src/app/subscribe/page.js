"use client";

import { useState } from "react";
import Link from "next/link";
import {
  FaArrowLeft,
  FaCheckCircle,
  FaCrown,
  FaLock,
} from "react-icons/fa";

import { supabase } from "@/lib/supabaseClient";

const plans = [
  {
    id: "monthly",
    name: "Monthly",
    price: 99,
    duration: "30 days",
    description: "Flexible monthly premium access.",
  },
  {
    id: "quarterly",
    name: "Quarterly",
    price: 249,
    duration: "90 days",
    description: "Best for focused short-term preparation.",
    popular: true,
  },
  {
    id: "yearly",
    name: "Yearly",
    price: 799,
    duration: "365 days",
    description: "Complete preparation access for one year.",
  },
];

export default function SubscribePage() {
  const [loadingPlan, setLoadingPlan] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  async function loadRazorpayScript() {
    if (window.Razorpay) {
      return true;
    }

    const existingScript = document.querySelector(
      'script[src="https://checkout.razorpay.com/v1/checkout.js"]'
    );

    if (existingScript) {
      return new Promise((resolve) => {
        existingScript.addEventListener("load", () => resolve(true));
        existingScript.addEventListener("error", () => resolve(false));
      });
    }

    return new Promise((resolve) => {
      const script = document.createElement("script");

      script.src =
        "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;

      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);

      document.body.appendChild(script);
    });
  }

  async function handleSubscribe(plan) {
    setLoadingPlan(plan.id);
    setMessage("");
    setMessageType("");

    try {
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (
        sessionError ||
        !session?.user ||
        !session?.access_token
      ) {
        setMessage("Please log in before purchasing a subscription.");
        setMessageType("error");
        setLoadingPlan("");

        setTimeout(() => {
          window.location.href = "/login?redirect=/subscribe";
        }, 1200);

        return;
      }

      const scriptLoaded = await loadRazorpayScript();

      if (!scriptLoaded) {
        throw new Error(
          "Razorpay could not load. Check your internet connection."
        );
      }

      const orderResponse = await fetch(
        "/api/razorpay/create-order",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            plan: plan.id,
          }),
        }
      );

      const orderData = await orderResponse.json();

      if (!orderResponse.ok) {
        throw new Error(
          orderData?.error || "Unable to create payment order."
        );
      }

      if (
        !orderData?.orderId ||
        !orderData?.amount ||
        !orderData?.key
      ) {
        throw new Error(
          "The payment order response is incomplete."
        );
      }

      const options = {
        key: orderData.key,
        amount: orderData.amount,
        currency: orderData.currency || "INR",
        name: "The Aspire Nation",
        description: `${plan.name} Premium Membership`,
        order_id: orderData.orderId,

        handler: async function (paymentResponse) {
          try {
            setMessage("Verifying your payment...");
            setMessageType("info");

            const verifyResponse = await fetch(
              "/api/razorpay/verify-payment",
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${session.access_token}`,
                },
                body: JSON.stringify({
                  razorpay_order_id:
                    paymentResponse.razorpay_order_id,
                  razorpay_payment_id:
                    paymentResponse.razorpay_payment_id,
                  razorpay_signature:
                    paymentResponse.razorpay_signature,
                }),
              }
            );

            const verifyData = await verifyResponse.json();

            if (!verifyResponse.ok) {
              throw new Error(
                verifyData?.error ||
                  "Payment verification failed."
              );
            }

            setMessage(
              "Payment successful. Your premium membership is active."
            );
            setMessageType("success");

            setTimeout(() => {
              window.location.href = "/dashboard";
            }, 1000);
          } catch (error) {
            setMessage(
              error instanceof Error
                ? error.message
                : "Payment verification failed."
            );

            setMessageType("error");
            setLoadingPlan("");
          }
        },

        prefill: {
          name:
            session.user.user_metadata?.full_name || "",
          email: session.user.email || "",
          contact:
            session.user.user_metadata?.phone || "",
        },

        notes: {
          plan: plan.id,
        },

        theme: {
          color: "#b91c1c",
        },

        modal: {
          ondismiss: function () {
            setLoadingPlan("");
          },
        },
      };

      const razorpay = new window.Razorpay(options);

      razorpay.on("payment.failed", function (response) {
        const errorDescription =
          response?.error?.description ||
          "The payment could not be completed.";

        setMessage(errorDescription);
        setMessageType("error");
        setLoadingPlan("");
      });

      razorpay.open();
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Unable to start payment."
      );

      setMessageType("error");
      setLoadingPlan("");
    }
  }

  return (
    <main className="min-h-screen bg-gray-100 px-4 py-12 sm:px-6">
      <div className="mx-auto max-w-7xl">
        <Link
          href="/"
          className="inline-flex items-center gap-2 font-bold text-red-700 hover:text-red-800"
        >
          <FaArrowLeft />
          Back to Home
        </Link>

        <header className="mt-8 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-100">
            <FaCrown className="text-3xl text-red-700" />
          </div>

          <p className="mt-5 font-black uppercase tracking-[0.22em] text-red-700">
            Aspire Nation Premium
          </p>

          <h1 className="mt-3 text-4xl font-black text-gray-950 sm:text-5xl">
            One Subscription.
            <span className="block text-red-700">
              Complete Preparation.
            </span>
          </h1>

          <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-gray-600">
            Unlock the complete e-paper, premium current affairs,
            editorial analysis, daily quizzes and archives.
          </p>
        </header>

        {message && (
          <div
            className={`mx-auto mt-8 max-w-2xl rounded-2xl border px-5 py-4 text-center font-semibold ${
              messageType === "success"
                ? "border-green-200 bg-green-50 text-green-700"
                : messageType === "info"
                  ? "border-blue-200 bg-blue-50 text-blue-700"
                  : "border-red-200 bg-red-50 text-red-700"
            }`}
          >
            {message}
          </div>
        )}

        <section className="mt-12 grid gap-8 md:grid-cols-3">
          {plans.map((plan) => (
            <article
              key={plan.id}
              className={`relative flex flex-col rounded-3xl bg-white p-7 shadow-xl sm:p-8 ${
                plan.popular
                  ? "border-2 border-red-600"
                  : "border border-gray-100"
              }`}
            >
              {plan.popular && (
                <span className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-red-600 px-5 py-2 text-xs font-black uppercase tracking-widest text-white">
                  Most Popular
                </span>
              )}

              <h2 className="text-3xl font-black text-gray-950">
                {plan.name}
              </h2>

              <p className="mt-2 font-semibold text-gray-500">
                {plan.duration}
              </p>

              <div className="mt-6">
                <span className="text-5xl font-black text-red-700">
                  ₹{plan.price}
                </span>
              </div>

              <p className="mt-4 leading-7 text-gray-600">
                {plan.description}
              </p>

              <div className="mt-7 space-y-4">
                {[
                  "Complete daily e-paper",
                  "Premium current affairs",
                  "Full editorial analysis",
                  "Daily quiz access",
                  "Complete archives",
                  "Secure premium reader",
                ].map((feature) => (
                  <div
                    key={feature}
                    className="flex items-center gap-3"
                  >
                    <FaCheckCircle className="shrink-0 text-green-600" />

                    <span className="font-semibold text-gray-700">
                      {feature}
                    </span>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={() => handleSubscribe(plan)}
                disabled={Boolean(loadingPlan)}
                className={`mt-8 flex w-full items-center justify-center gap-2 rounded-xl px-6 py-4 font-black text-white transition disabled:cursor-not-allowed disabled:bg-gray-400 ${
                  plan.popular
                    ? "bg-red-600 hover:bg-red-700"
                    : "bg-gray-950 hover:bg-black"
                }`}
              >
                <FaLock />

                {loadingPlan === plan.id
                  ? "Opening Payment..."
                  : "Subscribe Now"}
              </button>
            </article>
          ))}
        </section>

        <section className="mx-auto mt-10 max-w-3xl rounded-2xl border border-gray-200 bg-white p-6 text-center shadow">
          <FaLock className="mx-auto text-2xl text-green-600" />

          <h2 className="mt-3 text-lg font-black text-gray-950">
            Secure Payment
          </h2>

          <p className="mt-2 text-sm leading-6 text-gray-500">
            Payments are processed securely through Razorpay.
            Premium access is activated only after successful
            server-side verification.
          </p>
        </section>
      </div>
    </main>
  );
}