"use client";

import { PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js";
import React from "react";
import { useUser } from "@clerk/nextjs";

const backendBaseUrl =
    process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000";

function CheckoutForm({ amount, pickup, dropoff, distanceKm, selectedCar }) {
    const stripe = useStripe();
    const elements = useElements();
    const { isLoaded, isSignedIn, user } = useUser();

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (!stripe || !elements) return;

        const { error: submitError } = await elements.submit();
        if (submitError) {
            console.error(submitError);
            return;
        }

        const origin =
            typeof window !== "undefined"
                ? window.location.origin
                : "http://localhost:3000";

        // 1) Create payment intent (your existing API route)
        const res = await fetch("/api/create-intent", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ amount }),
        });

        const data = await res.json();
        const clientSecret = data.clientSecret || data; // depending on your route

        // console.log("clientSecret:", clientSecret);

        // 2) Confirm payment (no redirect, we handle manually)
        const { error, paymentIntent } = await stripe.confirmPayment({
            clientSecret,
            elements,
            confirmParams: {
                // Required when using automatic payment methods
                return_url: `${origin}/payment-confirm`,
            },
            redirect: "if_required", // you can keep this
        });

        if (error) {
            console.error("Stripe error:", error.message);
            return;
        }

        // 3) Create ride in backend

        const userId = isLoaded && isSignedIn ? user.id : "guest";

        try {
            const rideRes = await fetch(`${backendBaseUrl}/api/rides`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    userId: userId,
                    pickup: pickup,
                    dropoff: dropoff,
                    distanceKm: distanceKm,
                    carType: selectedCar,
                    price: amount,
                    status: "booked",
                    stripePaymentIntentId: paymentIntent?.id,
                }),
            });

            const ride = await rideRes.json();

            if (!rideRes.ok) {
                console.error("Ride create error:", ride);
                return;
            }

            // 4) Go to trip-status page with rideId
            window.location.href = `/trip-status?rideId=${ride._id}`;
        } catch (e) {
            console.error("Backend error:", e);
        }
    };

    return (
        <div className="flex flex-col justify-center items-center w-full mt-6">
            <h2 className="m-5 font-bold">Amount to Pay: {amount}</h2>
            <form onSubmit={handleSubmit} className="max-w-md">
                <PaymentElement />
                <button className="w-full bg-black text-white p-2 rounded-lg mt-2 cursor-pointer hover:bg-gray-800 transition">
                    Pay
                </button>
            </form>
        </div>
    );
}

export default CheckoutForm;
