"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000";

export default function TripFallbackPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [showEmptyState, setShowEmptyState] = useState(false);

  useEffect(() => {
    const checkTripStatus = async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/api/rides/latest`, {
          credentials: "include",
        });

        if (!res.ok) {
          setShowEmptyState(true);
          return;
        }

        const data = await res.json();

        // adjust based on your backend response
        if (!data || data.status === "CANCELLED") {
          setShowEmptyState(true);
        } else if (data.status === "ONGOING" || data.status === "BOOKED") {
          router.replace(`/trip-status?rideId=${data._id}`);
        } else {
          setShowEmptyState(true);
        }
      } catch (error) {
        setShowEmptyState(true);
      } finally {
        setLoading(false);
      }
    };

    checkTripStatus();
  }, [router]);

  if (loading) return null;

  if (!showEmptyState) return null;

  return (
    <div className="bg-[#f1f1f1] flex h-screen items-center justify-center flex-col">
      <h2 className="text-[28px] z-20 mt-[-30px]">
        No Ride Booked Yet
      </h2>

      <Image
        src="/uberconfirm.gif"
        width={500}
        height={150}
        alt="No trip available"
        className="object-cover mt-[-60px]"
      />

      <h2 className="font-bold text-[22px] mt-[-20px] mb-10 text-center">
        No Trip Status Available
      </h2>

      <button
        className="p-2 bg-black text-white px-10 rounded-lg cursor-pointer"
        onClick={() => router.push("/")}
      >
        Book a Ride
      </button>
    </div>
  );
}
