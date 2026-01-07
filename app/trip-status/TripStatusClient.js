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
  // MOVE DRIVER + FETCH RIDE (KEY FIX)
  // ==============================
  useEffect(() => {
    if (!rideId) {
      setLoading(false);
      return;
    }

    let intervalId;

    const updateTrip = async () => {
      try {
        // 🔁 MOVE DRIVER (THIS MAKES MARKER MOVE)
        await fetch(`${BACKEND_URL}/api/rides/${rideId}/move-driver`, {
          method: "PATCH",
        });

        // 🔄 FETCH UPDATED RIDE
        const res = await fetch(`${BACKEND_URL}/api/rides/${rideId}`);
        const data = await res.json();
        setRide(data);

        // 🛑 STOP WHEN DONE
        if (data.status === "completed" || data.status === "cancelled") {
          clearInterval(intervalId);
        }
      } catch (err) {
        console.error("Trip update error:", err);
      } finally {
        setLoading(false);
      }
    };

    updateTrip(); // first run immediately
    intervalId = setInterval(updateTrip, 1000); // every second

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
  // CANCEL TRIP
  // ==============================
  const cancelTrip = async () => {
    setUpdating(true);
    await fetch(`${BACKEND_URL}/api/rides/${rideId}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "cancelled" }),
    });
    setUpdating(false);
    window.location.href = "/trips";
  };

  // ==============================
  // UI STATES
  // ==============================
  if (loading) return <div className="p-6">Loading trip...</div>;
  if (!ride || ride.error) return <div className="p-6">Trip not found.</div>;

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
      {ride.driver && ( <div className="mt-6 border p-4 rounded-lg"> <h3 className="font-bold mb-2">Driver Details</h3> <p>Name: {ride.driver.name}</p> <p>Car: {ride.driver.carNumber}</p> <p>Status: {ride.status}</p> </div> )}
    </div>
  );
}
