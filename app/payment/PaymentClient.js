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

  const amount = Number(searchParams.get("amount") || 0);
  const pickupRaw = searchParams.get("pickup");
  const dropoffRaw = searchParams.get("dropoff");
  const distanceKm = Number(searchParams.get("distanceKm") || 0);
  const carType = searchParams.get("carType") || "Sedan";

  const pickup = pickupRaw ? JSON.parse(pickupRaw) : null;
  const dropoff = dropoffRaw ? JSON.parse(dropoffRaw) : null;

  const options = {
    mode: "payment",
    amount: Math.round(amount * 100),
    currency: "inr",
  };

  return (
    <Elements stripe={stripePromise} options={options}>
      <CheckoutForm
        amount={amount}
        pickup={pickup}
        dropoff={dropoff}
        distanceKm={distanceKm}
        selectedCar={carType}
      />
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
