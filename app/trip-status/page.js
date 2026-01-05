import { Suspense } from "react";
import TripStatusClient from "./TripStatusClient";

export default function TripStatusPage({ searchParams }) {
//   const rideId = searchParams.rideId; // safe access

 return (
    <Suspense fallback={<div>Loading trip...</div>}>
      <TripStatusClient />
    </Suspense>
  );
}
