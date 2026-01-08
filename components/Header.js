"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { UserButton, useUser } from "@clerk/nextjs";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000";

function Header() {
  const { user } = useUser();
  const userId = user?.id;

  const [openMenu, setOpenMenu] = useState(null);
  const [trips, setTrips] = useState([]);
  const menuRef = useRef(null);
  const intervalRef = useRef(null);

  // ==============================
  // FETCH USER TRIPS (REUSABLE)
  // ==============================
  const fetchTrips = async () => {
    if (!userId) return;
    try {
      const res = await fetch(`${BACKEND_URL}/api/rides/user/${userId}`);
      const data = await res.json();
      setTrips(Array.isArray(data) ? data : []);
    } catch {
      setTrips([]);
    }
  };

  // ==============================
  // INITIAL + POLLING FETCH
  // ==============================
  useEffect(() => {
    if (!userId) return;

    fetchTrips();

    intervalRef.current = setInterval(fetchTrips, 5000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [userId]);

  // ==============================
  // REFRESH ON TAB FOCUS
  // ==============================
  useEffect(() => {
    const onFocus = () => fetchTrips();
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [userId]);

  // ==============================
  // ACTIVE TRIP DETECTION
  // ==============================
  const activeTrip = trips.find(
    t =>
      t.status?.toLowerCase() === "booked" ||
      t.status?.toLowerCase() === "ongoing"
  );

  // ==============================
  // MENU CONFIG
  // ==============================
  const headerMenu = [
    {
      id: 1,
      name: "Ride",
      icon: "/taxi.jpeg",
      href: "/",
      dropdown: [
        {
          name: "Trip Status",
          href: activeTrip
            ? `/trip-status?rideId=${activeTrip._id}`
            : "/trip-status",
        },
        { name: "Trip History", href: "/trips" },
      ],
    },
    {
      id: 2,
      name: "Box",
      icon: "/box.jpeg",
      href: "/",
    },
  ];

  // ==============================
  // CLOSE MENU ON OUTSIDE CLICK
  // ==============================
  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpenMenu(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ==============================
  // UI
  // ==============================
  return (
    <div className="p-5 pb-3 pl-10 border-b-[4px] border-gray-200 flex items-center justify-between">
      <div className="flex gap-24 items-center">
        <Link href="/">
          <Image
            src="/Uber_logo_2018.png"
            width={70}
            height={70}
            alt="Logo"
          />
        </Link>

        <div className="flex gap-6 items-center" ref={menuRef}>
          {headerMenu.map(item => (
            <div key={item.id} className="relative flex items-center gap-1">
              <Link
                href={item.href}
                className="flex items-center gap-2 px-2 py-1 hover:bg-gray-100 rounded"
              >
                <Image src={item.icon} width={17} height={17} alt={item.name} />
                <span className="text-sm font-medium">{item.name}</span>
              </Link>

              {item.dropdown && (
                <button
                  onClick={() =>
                    setOpenMenu(openMenu === item.name ? null : item.name)
                  }
                  className="p-1 hover:bg-gray-200 rounded"
                >
                  ▼
                </button>
              )}

              {item.dropdown && openMenu === item.name && (
                <div className="absolute top-full left-0 mt-2 w-44 bg-white border shadow rounded z-50">
                  {item.dropdown.map(drop => (
                    <Link
                      key={drop.name}
                      href={drop.href}
                      onClick={() => setOpenMenu(null)}
                      className="block px-4 py-2 text-sm hover:bg-gray-100"
                    >
                      {drop.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <UserButton />
    </div>
  );
}

export default Header;
