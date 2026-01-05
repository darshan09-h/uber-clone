"use client";
import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export default function TripHistory() {
  const { user } = useUser();
  const [trips, setTrips] = useState([]);

  useEffect(() => {
    if (!user) return;

    fetch(`${BACKEND_URL}/api/rides/user/${user.id}`)
      .then(res => res.json())
      .then(setTrips);
  }, [user]);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Your Trips</h1>

      {trips.map(trip => (
        <div key={trip._id} className="border p-4 mb-3 rounded">
          <p><b>Status:</b> {trip.status}</p>
          <p><b>Pickup:</b> {trip.pickup.label}</p>
          <p><b>Dropoff:</b> {trip.dropoff.label}</p>
          <p><b>Price:</b> ₹{trip.price}</p>
        </div>
      ))}
    </div>
  );
}
