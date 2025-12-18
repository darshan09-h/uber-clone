"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";

const GEOAPIFY_URL = "https://api.geoapify.com/v1/geocode/autocomplete";

function InputItem({ type, onSelect }) {
  const [inputValue, setInputValue] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [hasSelected, setHasSelected] = useState(false);
  const containerRef = useRef(null);

  // fetch suggestions when user types (but not right after a selection)
  useEffect(() => {
    if (hasSelected) return; // do not search again right after selecting

    if (!inputValue || inputValue.length < 3) {
      setSuggestions([]);
      setIsOpen(false);
      return;
    }

    const controller = new AbortController();
    const timeout = setTimeout(async () => {
      try {
        setLoading(true);

        const url = `${GEOAPIFY_URL}?text=${encodeURIComponent(
          inputValue
        )}&limit=5&apiKey=${process.env.NEXT_PUBLIC_GEOAPIFY_API_KEY}`;

        const res = await fetch(url, { signal: controller.signal });
        const data = await res.json();
        setSuggestions(data.features || []);
        setIsOpen(true);
      } catch (err) {
        if (!(err instanceof DOMException && err.name === "AbortError")) {
          console.error("Geoapify error:", err);
        }
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => {
      controller.abort();
      clearTimeout(timeout);
    };
  }, [inputValue, hasSelected]);

  // close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (feature) => {
    const value = {
      label: feature.properties.formatted,
      lat: feature.properties.lat,
      lon: feature.properties.lon,
      raw: feature,
    };

    setInputValue(value.label);
    setSuggestions([]);
    setIsOpen(false);
    setHasSelected(true); // block immediate re-search

    if (onSelect) onSelect(value);

    console.log(
      type,
      "selected:",
      value.label,
      value.lat,
      value.lon
    );
  };

  const placeholder =
    type === "source" ? "Pickup Location" : "Dropoff Location";

  return (
    <div
      ref={containerRef}
      className="bg-slate-200 p-3 rounded-lg mt-3 flex items-start gap-4 relative"
    >
      <Image
        src={type === "source" ? "/source.png" : "/desti.png"}
        width={15}
        height={15}
        alt="Location icon"
        className="mt-2"
      />

      <div className="w-full relative">
        <input
          type="text"
          placeholder={placeholder}
          className="bg-transparent w-full outline-none"
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value);
            setHasSelected(false); // typing again re-enables search
          }}
          onFocus={() => {
            // only show dropdown if we already have suggestions
            if (suggestions.length > 0) setIsOpen(true);
          }}
        />

        {loading && (
          <div className="absolute left-0 top-full mt-1 text-xs text-gray-500 bg-white px-2 py-1 rounded shadow">
            Searching…
          </div>
        )}

        {isOpen && suggestions.length > 0 && (
          <ul className="absolute left-0 right-0 top-full mt-1 max-h-60 overflow-auto bg-white border rounded-lg shadow z-20 text-sm">
            {suggestions.map((item, idx) => (
              <li
                key={idx}
                className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                onMouseDown={(e) => {
                  // select BEFORE input blur, and prevent new search
                  e.preventDefault();
                  handleSelect(item);
                }}
              >
                {item.properties.formatted}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default InputItem;
