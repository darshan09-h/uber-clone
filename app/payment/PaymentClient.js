"use client";

import React, { Suspense } from "react";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { useSearchParams } from "next/navigation";
import CheckoutForm from "../../components/Home/CheckoutForm";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHER_KEY
);

function PaymentInner() {
  const searchParams = useSearchParams();
  const amountParam = searchParams.get("amount");
  const amount = Number(amountParam || 0);

  const options = {
    mode: "payment",
    amount: Math.round(amount * 100),
    currency: "inr",
  };

  return (
    <Elements stripe={stripePromise} options={options}>
      <CheckoutForm amount={amount} />
    </Elements>
  );
}

export default function PaymentClient() {
  return (
    <Suspense fallback={<div>Loading payment...</div>}>
      <PaymentInner />
    </Suspense>
  );
}
