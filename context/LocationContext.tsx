"use client";

// context/LocationContext.tsx
// Hydration-safe Global GPS Location & Reverse-Geocoding Context

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

export interface UserLocation {
  latitude: number | null;
  longitude: number | null;
  city: string;
  area: string;
  state: string;
  status: "idle" | "locating" | "success" | "denied" | "error";
  isDetected: boolean;
}

interface LocationContextType {
  location: UserLocation;
  detectLocation: () => Promise<void>;
  setManualCity: (city: string) => void;
  isMounted: boolean;
}

const DEFAULT_LOCATION: UserLocation = {
  latitude: null,
  longitude: null,
  city: "Hyderabad",
  area: "",
  state: "Telangana",
  status: "idle",
  isDetected: false,
};

const LocationContext = createContext<LocationContextType>({
  location: DEFAULT_LOCATION,
  detectLocation: async () => {},
  setManualCity: () => {},
  isMounted: false,
});

export function LocationProvider({ children }: { children: React.ReactNode }) {
  const [location, setLocation] = useState<UserLocation>(DEFAULT_LOCATION);
  const [isMounted, setIsMounted] = useState(false);

  // Read saved location from localStorage after client mount to prevent hydration mismatch
  useEffect(() => {
    setIsMounted(true);
    const saved = localStorage.getItem("yelp_user_location");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.city) {
          setLocation(parsed);
        }
      } catch {
        /* Fallback */
      }
    }
  }, []);

  // Reverse geocode coordinates to City & Area via OpenStreetMap Nominatim
  const reverseGeocode = async (lat: number, lon: number) => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`,
        { headers: { "User-Agent": "YelpIndiaLocation/1.0" } },
      );
      if (res.ok) {
        const data = await res.json();
        const address = data.address || {};
        const detectedCity =
          address.city ||
          address.town ||
          address.suburb ||
          address.county ||
          address.state_district ||
          "Hyderabad";

        const area = address.suburb || address.neighbourhood || address.residential || "";
        const state = address.state || "";

        const updated: UserLocation = {
          latitude: lat,
          longitude: lon,
          city: detectedCity,
          area,
          state,
          status: "success",
          isDetected: true,
        };

        setLocation(updated);
        localStorage.setItem("yelp_user_location", JSON.stringify(updated));
      }
    } catch {
      const updated: UserLocation = {
        ...location,
        latitude: lat,
        longitude: lon,
        status: "success",
        isDetected: true,
      };
      setLocation(updated);
    }
  };

  // Trigger GPS detection
  const detectLocation = useCallback(async () => {
    if (typeof window === "undefined" || !navigator.geolocation) {
      setLocation((prev) => ({ ...prev, status: "error" }));
      return;
    }

    setLocation((prev) => ({ ...prev, status: "locating" }));

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        reverseGeocode(latitude, longitude);
      },
      (err) => {
        console.warn("[Location Error]", err.message);
        setLocation((prev) => ({ ...prev, status: "denied" }));
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 },
    );
  }, []);

  // Auto-detect on first visit if not saved
  useEffect(() => {
    if (isMounted && !location.isDetected && location.status === "idle") {
      detectLocation();
    }
  }, [isMounted, location.isDetected, location.status, detectLocation]);

  const setManualCity = (city: string) => {
    const updated: UserLocation = {
      ...location,
      city: city || "Hyderabad",
      area: "",
      isDetected: false,
    };
    setLocation(updated);
    localStorage.setItem("yelp_user_location", JSON.stringify(updated));
  };

  return (
    <LocationContext.Provider value={{ location, detectLocation, setManualCity, isMounted }}>
      {children}
    </LocationContext.Provider>
  );
}

export function useLocationContext() {
  return useContext(LocationContext);
}
