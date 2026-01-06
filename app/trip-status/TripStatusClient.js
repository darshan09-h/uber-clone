"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
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
  // POLL RIDE STATUS (EASY FIX)
  // ==============================
  useEffect(() => {
    if (!rideId) {
      setLoading(false);
      return;
    }

    const fetchRide = async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/api/rides/${rideId}`);
        const data = await res.json();
        setRide(data);
      } catch (err) {
        console.error("Fetch ride error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchRide(); // first load

    const intervalId = setInterval(fetchRide, 3000); // poll every 3 sec
    return () => clearInterval(intervalId);
  }, [rideId]);

  // ==============================
  // FETCH ROUTE WHEN RIDE LOADS
  // ==============================
  useEffect(() => {
    if (!ride?.pickup || !ride?.dropoff) return;

    fetchRoute(ride.pickup, ride.dropoff)
      .then(setRouteGeoJson)
      .catch(err => console.error("Route error:", err));
  }, [ride]);

  // ==============================
  // UPDATE STATUS (CANCEL)
  // ==============================
  const updateStatus = async (status) => {
    if (!rideId) return;
    setUpdating(true);
    try {
      const res = await fetch(`${BACKEND_URL}/api/rides/${rideId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (res.ok) setRide(data);
    } catch (err) {
      console.error(err);
    } finally {
      setUpdating(false);
    }
  };

  const cancelTrip = async () => {
    await updateStatus("cancelled");
    window.location.href = "/trips";
  };

  // ==============================
  // AUTO REDIRECT AFTER COMPLETION
  // ==============================
  useEffect(() => {
    if (ride?.status === "completed") {
      setTimeout(() => {
        window.location.href = "/trips";
      }, 2000);
    }
  }, [ride]);

  // ==============================
  // UI STATES
  // ==============================
  if (loading) return <div className="p-6">Loading trip...</div>;
  if (!ride || ride.error) return <div className="p-6">Trip not found.</div>;

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-semibold mb-4">Trip Status</h1>

      {/* TRIP DETAILS */}
      <div className="bg-white rounded-lg shadow p-4 space-y-2">
        <p>
          <span className="font-semibold">Status:</span>{" "}
          <span className="capitalize">{ride.status}</span>
        </p>
        <p>
          <span className="font-semibold">Pickup:</span>{" "}
          {ride.pickup?.label}
        </p>
        <p>
          <span className="font-semibold">Dropoff:</span>{" "}
          {ride.dropoff?.label}
        </p>
        <p>
          <span className="font-semibold">Distance:</span>{" "}
          {ride.distanceKm} km
        </p>
        <p>
          <span className="font-semibold">Price:</span> ₹{ride.price}
        </p>
      </div>

      {/* MAP */}
      <div className="mt-6">
        <MapSectionClient
          pickup={ride.pickup}
          dropoff={ride.dropoff}
          routeGeoJson={routeGeoJson}
          focus="both"
          driver={ride.driver}
        />
      </div>

      {/* ACTIONS */}
      <div className="mt-4 flex gap-3 flex-wrap">
        {(ride.status === "booked" || ride.status === "ongoing") && (
          <button
            onClick={cancelTrip}
            disabled={updating}
            className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition"
          >
            Cancel Trip
          </button>
        )}

        <button
          onClick={() => (window.location.href = "/")}
          className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition cursor-pointer"
        >
          Book New Ride
        </button>
      </div>

      {/* DRIVER DETAILS */}
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
