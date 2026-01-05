// app/page.js
"use client";

import { useState } from "react";
import SearchSection from "../components/Home/SearchSection";
import MapSectionClient from "../components/Home/MapSectionClient";
import CarList from "../components/Home/CarList";

export default function Home() {
  const [pickup, setPickup] = useState(null);
  const [dropoff, setDropoff] = useState(null);
  const [routeGeoJson, setRouteGeoJson] = useState(null);
  const [focus, setFocus] = useState("pickup"); // "pickup" | "dropoff" | "both"
  const [distanceKm, setDistanceKm] = useState(0);

  console.log("distanceKm in page:",distanceKm)

  return (
    <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-5 min-h-[calc(100vh-80px)]">
      <div className="md:col-span-1">
        <SearchSection
          pickup={pickup}
          dropoff={dropoff}
          setPickup={(v) => {
            setPickup(v);
            setFocus("pickup");
          }}
          setDropoff={(v) => {
            setDropoff(v);
            setFocus("dropoff");
          }}
          setRouteGeoJson={setRouteGeoJson}
          setDistanceKm={setDistanceKm}
          setFocus={setFocus}
        />
         {distanceKm > 0 && <CarList distanceKm={distanceKm} pickup={pickup} dropoff={dropoff}/>}
      </div>
      <div className="md:col-span-2">
        <MapSectionClient
          pickup={pickup}
          dropoff={dropoff}
          routeGeoJson={routeGeoJson}
          focus={focus}
        />
      </div>
      
    </div>
  );
}
