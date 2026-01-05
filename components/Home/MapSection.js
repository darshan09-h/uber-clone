"use client";

import { MapContainer, TileLayer, Marker, Popup, Polyline, Tooltip, useMap, } from "react-leaflet";
import L from "leaflet";
import { useEffect, useMemo } from "react";

const defaultCenter = [23.0216, 72.5797]; // default city

// Custom icons from /public/source.jpg and /public/dest.jpg
const pickupIcon = L.icon({
  iconUrl: "/source2.png", // circle
  iconSize: [25, 25],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

const dropoffIcon = L.icon({
  iconUrl: "/Destination.png", // square
  iconSize: [20, 20],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

// Optional: keep default icon setup for other markers (not strictly needed now)
function fixLeafletIcons() {
  delete L.Icon.Default.prototype._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl:
      "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    iconUrl:
      "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    shadowUrl:
      "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  });
}

// Recenter logic based on focus: "pickup" | "dropoff" | "both"
function Recenter({ pickup, dropoff, focus }) {
  const map = useMap();

  useEffect(() => {
    if (focus === "pickup" && pickup) {
      map.flyTo([pickup.lat, pickup.lon], 15);
    } else if (focus === "dropoff" && dropoff) {
      map.flyTo([dropoff.lat, dropoff.lon], 15);
    } else if (focus === "both" && pickup && dropoff) {
      const bounds = [
        [pickup.lat, pickup.lon],
        [dropoff.lat, dropoff.lon],
      ];
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [focus, pickup, dropoff, map]);

  return null;
}

function MapSection({ pickup, dropoff, routeGeoJson, focus, driver }) {
  useEffect(() => {
    fixLeafletIcons();
  }, []);

  // Build polyline coords from Geoapify routing GeoJSON
  const routeCoords = useMemo(() => {
    if (!routeGeoJson) return null;

    const feature =
      routeGeoJson.features && routeGeoJson.features.length
        ? routeGeoJson.features[0]
        : routeGeoJson;

    let geom = feature.geometry;
    if (!geom && feature.properties?.route_parts?.[0]?.geometry) {
      geom = feature.properties.route_parts[0].geometry;
    }

    if (!geom || !geom.coordinates) return null;

    // LineString -> [[lon, lat], ...]
    if (geom.type === "LineString") {
      return geom.coordinates.map(([lon, lat]) => [lat, lon]);
    }

    // MultiLineString -> take first segment [[lon, lat], ...]
    if (geom.type === "MultiLineString") {
      const firstSegment = geom.coordinates[0];
      if (!firstSegment) return null;
      return firstSegment.map(([lon, lat]) => [lat, lon]);
    }

    return null;
  }, [routeGeoJson]);

  return (
    <div className="w-full h-[60vh] md:h-[calc(100vh-120px)] rounded-xl overflow-hidden">
      <MapContainer
        center={defaultCenter}
        zoom={12}
        style={{ width: "100%", height: "100%" }}
      >
        <Recenter pickup={pickup} dropoff={dropoff} focus={focus} />

        <TileLayer
          url={`https://maps.geoapify.com/v1/tile/klokantech-basic/{z}/{x}/{y}.png?apiKey=${process.env.NEXT_PUBLIC_GEOAPIFY_API_KEY}`}
          attribution='&copy; OpenStreetMap contributors, &copy; Geoapify'
        />

        {pickup && (
          <Marker position={[pickup.lat, pickup.lon]} icon={pickupIcon}>
            <Tooltip
              permanent
              direction="right"      // label on the side
              offset={[15, 0]}       // fixed gap between marker and label
              opacity={1}
              className="ride-label" // custom class for styling
            >
              <span className="font-bold text-black text-xs">
                {pickup.label.split(",")[0]} {/* only first line, e.g. street */}
              </span>
            </Tooltip>
          </Marker>
        )}

        {dropoff && (
          <Marker position={[dropoff.lat, dropoff.lon]} icon={dropoffIcon}>
            <Tooltip
              permanent
              direction="right"
              offset={[15, 0]}
              opacity={1}
              className="ride-label"
            >
              <span>
                {dropoff.label.split(",")[0]}
              </span>
            </Tooltip>
          </Marker>
        )}

        {driver && (
          <Marker position={[driver.lat, driver.lon]}>
            <Popup>
              <b>{driver.name}</b><br />
              {driver.carNumber}
            </Popup>
          </Marker>
        )}


        {routeCoords && (
          <Polyline positions={routeCoords} color="#000" weight={5} />
        )}
      </MapContainer>
    </div>
  );
}

export default MapSection;