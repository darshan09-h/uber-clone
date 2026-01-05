// app/trip-status/TripStatusClient.js
"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
// import TripHistory from "../trips/page";
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

  async function fetchRoute(pickup, dropoff) {
    const url = `${ROUTING_URL}?waypoints=${pickup.lat},${pickup.lon}|${dropoff.lat},${dropoff.lon}&mode=drive&details=geometry&apiKey=${process.env.NEXT_PUBLIC_GEOAPIFY_API_KEY}`;

    const res = await fetch(url);
    if (!res.ok) throw new Error("Failed to fetch route");

    return res.json();
  }

  useEffect(() => {
    if (!rideId) {
      setLoading(false);
      return;
    }

    let intervalId;

    const fetchRide = async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/api/rides/${rideId}`);
        const data = await res.json();
        setRide(data);
      } catch (e) {
        console.error("Fetch ride error:", e);
      } finally {
        setLoading(false);
      }
    };

    const moveDriver = async () => {
      try {
        const res = await fetch(
          `${BACKEND_URL}/api/rides/${rideId}/move-driver`,
          { method: "PATCH" }
        );
        const data = await res.json();
        setRide(data);

        // 🛑 Stop polling when trip ends
        if (data.status === "completed" || data.status === "cancelled") {
          clearInterval(intervalId);
        }
      } catch (e) {
        console.error("Move driver error:", e);
      }
    };

    // 🔥 FIRST FETCH IMMEDIATELY
    fetchRide();

    // 🔁 START MOVEMENT AFTER FETCH
    intervalId = setInterval(moveDriver, 1000);

    return () => clearInterval(intervalId);
  }, [rideId]);

  useEffect(() => {
    if (!ride?.pickup || !ride?.dropoff) return;

    fetchRoute(ride.pickup, ride.dropoff)
      .then(setRouteGeoJson)
      .catch(err => console.error("Route error:", err));
  }, [ride]);



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
      else console.error("Update status error:", data);
    } catch (e) {
      console.error(e);
    } finally {
      setUpdating(false);
    }
  };

  const cancelTrip = async () => {
    await updateStatus("cancelled");
    window.location.href = "/";
  };

  if (loading) return <div className="p-6">Loading trip...</div>;
  if (!ride || ride.error) return <div className="p-6">Trip not found.</div>;

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-semibold mb-4">Trip Status</h1>

      <div className="bg-white rounded-lg shadow p-4 space-y-2">
        <p>
          <span className="font-semibold">Status:</span> {ride.status}
        </p>
        <p>
          <span className="font-semibold">Pickup:</span> {ride.pickup?.label}
        </p>
        <p>
          <span className="font-semibold">Dropoff:</span> {ride.dropoff?.label}
        </p>
        <p>
          <span className="font-semibold">Distance:</span> {ride.distanceKm} km
        </p>
        <p>
          <span className="font-semibold">Price:</span> ₹{ride.price}
        </p>
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
        {ride.status === "booked" && (
          <button
            onClick={cancelTrip}
            disabled={updating}
            className="bg-red-500 text-white px-4 py-2 rounded-lg"
          >
            Cancel Trip
          </button>
        )}

        {ride.driver && (
          <div className="mt-4 border p-4 rounded-lg">
            <h3 className="font-bold">Driver Details</h3>
            <p>Name: {ride.driver.name}</p>
            <p>Car: {ride.driver.carNumber}</p>
            <p>Status: {ride.status}</p>
          </div>
        )}


        <button
          onClick={() => (window.location.href = "/")}
          className="mt-4 bg-black text-white px-4 py-1 rounded-xl"
        >
          Book New Ride
        </button>
      </div>
    </div>
  );
}
