// components/Home/MapSectionClient.js
"use client";

import dynamic from "next/dynamic";

const MapSectionInner = dynamic(() => import("./MapSection"), {
  ssr: false,
});

function MapSectionClient({ pickup, dropoff, routeGeoJson, focus, driver }) {
  return (
    <MapSectionInner
      pickup={pickup}
      dropoff={dropoff}
      routeGeoJson={routeGeoJson}
      focus={focus}
      driver={driver}
    />
  );
}

export default MapSectionClient;
