"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { UserButton } from "@clerk/nextjs";

function Header() {
  const [openMenu, setOpenMenu] = useState(null);
  const menuRef = useRef(null);

  const headerMenu = [
    {
      id: 1,
      name: "Ride",
      icon: "/taxi.jpeg",
      href: "/",
      dropdown: [{ name: "Trip History", href: "/trips" }]
    },
    {
      id: 2,
      name: "Box",
      icon: "/box.jpeg",
      href: "/"
    }
  ];

  // Close dropdown on outside click
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

  return (
    <div className="p-5 pb-3 pl-10 border-b-[4px] border-gray-200 flex items-center justify-between">
      <div className="flex gap-24 items-center">
        {/* Logo */}
        <Link href="/">
          <Image src="/Uber_logo_2018.png" width={70} height={70} alt="Logo" />
        </Link>

        {/* Menu */}
        <div className="flex gap-6 items-center" ref={menuRef}>
          {headerMenu.map(item => (
            <div key={item.id} className="relative flex items-center gap-1">
              
              {/* Main Click (Ride / Box) */}
              <Link
                href={item.href}
                className="flex items-center gap-2 px-2 py-1 rounded-4xl hover:bg-gray-100"
              >
                <Image src={item.icon} width={17} height={17} alt={item.name} />
                <span className="text-[14px] font-medium">{item.name}</span>
              </Link>

              {/* Arrow Button (only if dropdown exists) */}
              {item.dropdown && (
                <button
                  onClick={() =>
                    setOpenMenu(openMenu === item.name ? null : item.name)
                  }
                  className="p-1 rounded-2xl hover:bg-gray-200 transition"
                >
                  <span className="text-xs">▼</span>
                </button>
              )}

              {/* Dropdown */}
              {item.dropdown && openMenu === item.name && (
                <div className="absolute top-full left-0 mt-2 w-44 bg-white border shadow-lg rounded-lg z-50">
                  {item.dropdown.map(drop => (
                    <Link
                      key={drop.name}
                      href={drop.href}
                      onClick={() => setOpenMenu(null)}
                      className="block px-4 py-2 text-sm hover:bg-gray-100 rounded-lg"
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
