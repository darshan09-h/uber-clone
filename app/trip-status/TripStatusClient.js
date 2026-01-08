"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import Image from "next/image";
import MapSectionClient from "../../components/Home/MapSectionClient";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000";

export default function TripStatusClient() {
  const searchParams = useSearchParams();
  const rideId = searchParams.get("rideId");

  const [ride, setRide] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [routeGeoJson, setRouteGeoJson] = useState(null);

  const ROUTING_URL = "https://api.geoapify.com/v1/routing";

  // ==============================
  // FETCH ROUTE
  // ==============================
  async function fetchRoute(pickup, dropoff) {
    const url = `${ROUTING_URL}?waypoints=${pickup.lat},${pickup.lon}|${dropoff.lat},${dropoff.lon}&mode=drive&details=geometry&apiKey=${process.env.NEXT_PUBLIC_GEOAPIFY_API_KEY}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error("Failed to fetch route");
    return res.json();
  }

  // ==============================
  // FETCH + MOVE DRIVER
  // ==============================
  useEffect(() => {
    if (!rideId) {
      setLoading(false);
      return;
    }

    let intervalId;

    const updateTrip = async () => {
      try {
        await fetch(`${BACKEND_URL}/api/rides/${rideId}/move-driver`, {
          method: "PATCH",
        });

        const res = await fetch(`${BACKEND_URL}/api/rides/${rideId}`);
        if (!res.ok) {
          setRide(null);
          return;
        }

        const data = await res.json();

        if (!data || data.status === "cancelled") {
          setRide(null);
          clearInterval(intervalId);
          return;
        }

        setRide(data);

        if (data.status === "completed") {
          clearInterval(intervalId);
        }
      } catch (err) {
        console.error("Trip update error:", err);
        setRide(null);
      } finally {
        setLoading(false);
      }
    };

    updateTrip();
    intervalId = setInterval(updateTrip, 1000);

    return () => clearInterval(intervalId);
  }, [rideId]);

  // ==============================
  // FETCH ROUTE
  // ==============================
  useEffect(() => {
    if (!ride?.pickup || !ride?.dropoff) return;

    fetchRoute(ride.pickup, ride.dropoff)
      .then(setRouteGeoJson)
      .catch(err => console.error("Route error:", err));
  }, [ride]);

  // ==============================
  // CANCEL TRIP
  // ==============================
  const cancelTrip = async () => {
    setUpdating(true);
    await fetch(`${BACKEND_URL}/api/rides/${rideId}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "cancelled" }),
    });
    setRide(null);
    setUpdating(false);
  };

  // ==============================
  // UI STATES
  // ==============================
  if (loading) return <div className="p-6">Loading trip...</div>;

  // ✅ EMPTY STATE (No ride / Cancelled / No rideId)
  if (!ride) {
    return (
      <div className="bg-[#f1f1f1] flex h-screen items-center justify-center flex-col">
        <h2 className="text-[28px] mt-[-30px]">
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
          onClick={() => (window.location.href = "/")}
        >
          Book a Ride
        </button>
      </div>
    );
  }

  // ==============================
  // ACTIVE TRIP UI
  // ==============================
  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-semibold mb-4">Trip Status</h1>

      <div className="bg-white rounded-lg shadow p-4 space-y-2">
        <p><b>Status:</b> {ride.status}</p>
        <p><b>Pickup:</b> {ride.pickup?.label}</p>
        <p><b>Dropoff:</b> {ride.dropoff?.label}</p>
        <p><b>Distance:</b> {ride.distanceKm} km</p>
        <p><b>Price:</b> ₹{ride.price}</p>
      </div>

      <div className="mt-6">
        <MapSectionClient
          pickup={ride.pickup}
          dropoff={ride.dropoff}
          routeGeoJson={routeGeoJson}
          focus="both"
          driver={ride.driver}
        />
      </div>

      <div className="mt-4 flex gap-3">
        {(ride.status === "booked" || ride.status === "ongoing") && (
          <button
            onClick={cancelTrip}
            disabled={updating}
            className="bg-red-500 text-white px-4 py-2 rounded-lg cursor-pointer hover:bg-red-800 transition"
          >
            Cancel Trip
          </button>
        )}

        <button
          onClick={() => (window.location.href = "/")}
          className="bg-black text-white px-4 py-2 rounded-lg cursor-pointer hover:bg-gray-800 transition"
        >
          Book New Ride
        </button>
      </div>

      {ride.driver && (
        <div className="mt-6 border p-4 rounded-lg">
          <h3 className="font-bold mb-2">Driver Details</h3>
          <p>Name: {ride.driver.name}</p>
          <p>Car: {ride.driver.carNumber}</p>
          <p>Status: {ride.status}</p>
        </div>
      )}
    </div>
  );
}
