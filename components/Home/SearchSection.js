// components/Home/SearchSection.js
"use client";

import React, { useEffect } from "react";
import InputItem from "./InputItem";
import CarList from "./CarList";

const ROUTING_URL = "https://api.geoapify.com/v1/routing";

async function fetchRoute(pickup, dropoff) {
  const url = `${ROUTING_URL}?waypoints=${pickup.lat},${pickup.lon}|${dropoff.lat},${dropoff.lon}&mode=drive&details=geometry&apiKey=${process.env.NEXT_PUBLIC_GEOAPIFY_API_KEY}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch route");
  const data = await res.json();

  // distance is in meters in properties.distance
  const feature =
    data.features && data.features.length ? data.features[0] : null;
  const distanceMeters = feature?.properties?.distance ?? 0; // meters
  const distanceKm = distanceMeters / 1000;

  return { data, distanceKm };
}

function SearchSection({
  pickup,
  dropoff,
  setPickup,
  setDropoff,
  setRouteGeoJson,
  setDistanceKm,
  setFocus, // "pickup" | "dropoff" | "both"
}) {
  // console.log("SearchSection props:", { setDistanceKm });

  // Auto-update route whenever both points are selected
  const handleSearch = async () => {
    if (!pickup || !dropoff) return;

    try {
      const { data, distanceKm } = await fetchRoute(pickup, dropoff);
      console.log("Distance from routing (km):", distanceKm);
      setRouteGeoJson(data);   // draw route
      setDistanceKm(distanceKm); // make CarList appear with prices
      setFocus && setFocus("both"); // zoom out to show both markers
    } catch (e) {
      console.error("Routing error:", e);
    }
  };

  return (
    <div className="p-2 md:pd-5 border-[2px] rounded-xl">
      <p className="text-[20px] font-bold">Get a ride</p>

      <InputItem
        type="source"
        onSelect={(val) => {
          setPickup(val);
          setFocus && setFocus("pickup");
        }}
      />

      <InputItem
        type="destination"
        onSelect={(val) => {
          setDropoff(val);
          setFocus && setFocus("dropoff");
        }}
      />

      <button
        className="p-3 bg-black w-full mt-5 text-white rounded-lg"
        onClick={handleSearch}
      >
        Search
      </button>
    </div>
  );
}

export default SearchSection;
