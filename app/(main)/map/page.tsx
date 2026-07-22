"use client";

// app/(main)/map/page.tsx
// Full-screen interactive places discovery map.
// Left sidebar: filterable place list
// Right: Full Leaflet map with clustered pins
// Clicking a list item pans the map; clicking a map pin highlights the list.

import dynamic from "next/dynamic";
import { useState, useMemo, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  MapPin,
  Search,
  Star,
  SlidersHorizontal,
  X,
  LayoutList,
} from "lucide-react";
import { cn, formatPriceLevel, getDistanceKm, formatDistance } from "@/lib/utils";
import { type PlacePin } from "@/components/common/PlacesMap";
import { useLocationContext } from "@/context/LocationContext";
import CitySelector from "@/components/common/CitySelector";

// Load PlacesMap client-only (no SSR — Leaflet uses window)
const PlacesMap = dynamic(
  () => import("@/components/common/PlacesMap"),
  { ssr: false, loading: () => <MapSkeleton /> },
);

// ── Types ─────────────────────────────────────────────────────────────────

// Initial seed from DB (server places)
const INITIAL_PLACES: PlacePin[] = [
  {
    id: "1",
    name: "Bukhara - ITC Maurya",
    slug: "bukhara-delhi",
    latitude: 28.5985,
    longitude: 77.1870,
    city: "New Delhi",
    averageRating: 0,
    reviewCount: 0,
    priceLevel: 4,
    category: "North Indian",
    primaryPhotoUrl:
      "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=400&q=60",
  },
  {
    id: "2",
    name: "Indian Accent",
    slug: "indian-accent-delhi",
    latitude: 28.5919,
    longitude: 77.2219,
    city: "New Delhi",
    averageRating: 0,
    reviewCount: 0,
    priceLevel: 4,
    category: "Fine Dining",
    primaryPhotoUrl:
      "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&q=60",
  },
  {
    id: "3",
    name: "Karim's Historic Mughlai",
    slug: "karims-old-delhi",
    latitude: 28.6507,
    longitude: 77.2334,
    city: "New Delhi",
    averageRating: 0,
    reviewCount: 0,
    priceLevel: 2,
    category: "Biryani & Kebabs",
    primaryPhotoUrl:
      "https://images.unsplash.com/photo-1544025162-d76694265947?w=400&q=60",
  },
  {
    id: "4",
    name: "Trishna Coastal Dining",
    slug: "trishna-mumbai",
    latitude: 18.9322,
    longitude: 72.8324,
    city: "Mumbai",
    averageRating: 0,
    reviewCount: 0,
    priceLevel: 3,
    category: "Coastal Seafood",
    primaryPhotoUrl:
      "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400&q=60",
  },
  {
    id: "5",
    name: "The Bombay Canteen",
    slug: "bombay-canteen-mumbai",
    latitude: 19.0057,
    longitude: 72.8295,
    city: "Mumbai",
    averageRating: 0,
    reviewCount: 0,
    priceLevel: 3,
    category: "Fine Dining",
    primaryPhotoUrl:
      "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400&q=60",
  },
  {
    id: "6",
    name: "Bademiya Street Kebabs",
    slug: "bademiya-mumbai",
    latitude: 18.9218,
    longitude: 72.8317,
    city: "Mumbai",
    averageRating: 0,
    reviewCount: 0,
    priceLevel: 2,
    category: "Street Food",
    primaryPhotoUrl:
      "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400&q=60",
  },
  {
    id: "7",
    name: "Paradise Biryani House",
    slug: "paradise-hyderabad",
    latitude: 17.4435,
    longitude: 78.4990,
    city: "Hyderabad",
    averageRating: 0,
    reviewCount: 0,
    priceLevel: 2,
    category: "Biryani & Kebabs",
    primaryPhotoUrl:
      "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400&q=60",
  },
  {
    id: "8",
    name: "Karavalli Heritage Kitchen",
    slug: "karavalli-bengaluru",
    latitude: 12.9716,
    longitude: 77.5946,
    city: "Bengaluru",
    averageRating: 0,
    reviewCount: 0,
    priceLevel: 3,
    category: "Coastal Seafood",
    primaryPhotoUrl:
      "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&q=60",
  },
  {
    id: "9",
    name: "Murugan Idli Shop",
    slug: "murugan-idli-chennai",
    latitude: 13.0786,
    longitude: 80.2646,
    city: "Chennai",
    averageRating: 0,
    reviewCount: 0,
    priceLevel: 1,
    category: "South Indian",
    primaryPhotoUrl:
      "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=400&q=60",
  },
  {
    id: "10",
    name: "Peter Cat",
    slug: "peter-cat-kolkata",
    latitude: 22.5462,
    longitude: 88.3525,
    city: "Kolkata",
    averageRating: 0,
    reviewCount: 0,
    priceLevel: 2,
    category: "Continental",
    primaryPhotoUrl:
      "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=400&q=60",
  },
  {
    id: "11",
    name: "Vaishali Restaurant",
    slug: "vaishali-pune",
    latitude: 18.5140,
    longitude: 73.8324,
    city: "Pune",
    averageRating: 0,
    reviewCount: 0,
    priceLevel: 1,
    category: "South Indian",
    primaryPhotoUrl:
      "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&q=60",
  },
  {
    id: "12",
    name: "Suvarna Mahal",
    slug: "suvarna-mahal-jaipur",
    latitude: 26.8955,
    longitude: 75.8067,
    city: "Jaipur",
    averageRating: 0,
    reviewCount: 0,
    priceLevel: 4,
    category: "Fine Dining",
    primaryPhotoUrl:
      "https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400&q=60",
  },
  {
    id: "13",
    name: "Fisherman's Wharf",
    slug: "fishermans-wharf-goa",
    latitude: 15.1719,
    longitude: 73.9485,
    city: "Goa",
    averageRating: 0,
    reviewCount: 0,
    priceLevel: 2,
    category: "Coastal Seafood",
    primaryPhotoUrl:
      "https://images.unsplash.com/photo-1559847844-5315695dadae?w=400&q=60",
  },
];

// ── Sub-components ────────────────────────────────────────────────────────

function MapSkeleton() {
  return (
    <div className="flex h-full items-center justify-center bg-zinc-100">
      <div className="flex flex-col items-center gap-3 text-zinc-400">
        <MapPin className="h-10 w-10 animate-pulse" />
        <p className="text-sm">Loading map…</p>
      </div>
    </div>
  );
}

function PlaceListCard({
  place,
  isActive,
  userLocation,
  onClick,
}: {
  place: PlacePin;
  isActive: boolean;
  userLocation?: { latitude: number; longitude: number } | null;
  onClick: () => void;
}) {
  const distanceKm = useMemo(() => {
    if (!userLocation) return null;
    return getDistanceKm(
      userLocation.latitude,
      userLocation.longitude,
      place.latitude,
      place.longitude,
    );
  }, [userLocation, place]);

  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full rounded-xl border p-3 text-left transition-all duration-150 hover:shadow-md",
        isActive
          ? "border-red-500 bg-red-50 shadow-md"
          : "border-zinc-200 bg-white hover:border-zinc-300",
      )}
    >
      <div className="flex gap-3">
        {place.primaryPhotoUrl && (
          <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg">
            <Image
              src={place.primaryPhotoUrl}
              alt={place.name}
              fill
              className="object-cover"
              sizes="56px"
            />
          </div>
        )}
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-1">
            <p className="truncate text-sm font-bold text-zinc-900">
              {place.name}
            </p>
            {distanceKm !== null && (
              <span className="shrink-0 text-[10px] font-bold text-red-600 bg-red-50 border border-red-100 px-1.5 py-0.5 rounded-full">
                {formatDistance(distanceKm)}
              </span>
            )}
          </div>
          <p className="text-xs text-zinc-500">
            {place.city}
            {place.category && ` · ${place.category}`}
          </p>
          <div className="mt-1 flex items-center gap-1.5">
            <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
            <span className="text-xs font-semibold text-zinc-700">
              {place.averageRating.toFixed(1)}
            </span>
            <span className="text-xs text-zinc-400">
              ({place.reviewCount.toLocaleString("en-IN")})
            </span>
            {place.priceLevel && (
              <span className="ml-auto text-xs text-zinc-400">
                {formatPriceLevel(place.priceLevel)}
              </span>
            )}
          </div>
        </div>
      </div>
    </button>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────

export default function MapPage() {
  const { location } = useLocationContext();
  const [places, setPlaces] = useState<PlacePin[]>(INITIAL_PLACES);
  const [activePlaceId, setActivePlaceId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCity, setSelectedCity] = useState<string>(location.city || "");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [userLocation, setUserLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [nearbyStatus, setNearbyStatus] = useState<"idle" | "locating" | "fetching" | "done" | "error">("idle");

  // Sync selected city with location context if not set manually
  useEffect(() => {
    if (location.city && !selectedCity) {
      setSelectedCity(location.city);
    }
  }, [location.city, selectedCity]);

  // Sync LocationContext with userLocation state
  useEffect(() => {
    if (location.latitude && location.longitude) {
      setUserLocation({ latitude: location.latitude, longitude: location.longitude });
    }
  }, [location.latitude, location.longitude]);

  // Load ALL DB-seeded places across India
  useEffect(() => {
    async function fetchMapPlaces() {
      try {
        const res = await fetch("/api/places?limit=1000");
        if (res.ok) {
          const data = await res.json();
          const mapped: PlacePin[] = (data.places || []).map((p: { id?: string; name: string; slug: string; latitude?: number; longitude?: number; city: string; averageRating?: number; rating?: number; reviewCount?: number; priceLevel?: number; cuisine?: string; category?: { name?: string }; photos?: Array<{ url?: string }> }) => ({
            id: p.id || p.slug,
            name: p.name,
            slug: p.slug,
            latitude: p.latitude ?? 20.5937,
            longitude: p.longitude ?? 78.9629,
            city: p.city,
            averageRating: p.averageRating ?? p.rating ?? 0.0,
            reviewCount: p.reviewCount ?? 0,
            priceLevel: p.priceLevel ?? 2,
            category: p.category?.name || p.cuisine || "Restaurant",
            primaryPhotoUrl: p.photos?.[0]?.url || "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&q=60",
          }));
          if (mapped.length > 0) setPlaces(mapped);
        }
      } catch (err) {
        console.error("Failed to fetch map places", err);
      }
    }
    fetchMapPlaces();
  }, []);

  // ── Google Places Nearby Search (real live data) ─────────────────────────
  const fetchGoogleNearbyRestaurants = async (lat: number, lng: number) => {
    setNearbyStatus("fetching");
    try {
      const res = await fetch(
        `/api/places/nearby?lat=${lat}&lng=${lng}&radius=5000&keyword=restaurant`,
      );
      if (!res.ok) throw new Error("API error");
      const data = await res.json();

      const googlePlaces: PlacePin[] = (data.places ?? []).map(
        (p: {
          id: string;
          name: string;
          slug: string;
          latitude: number;
          longitude: number;
          city: string;
          averageRating: number;
          reviewCount: number;
          priceLevel: number;
          category: string;
          primaryPhotoUrl: string;
          isOpen?: boolean;
        }) => ({
          id: p.id,
          name: p.name,
          slug: p.slug,
          latitude: p.latitude,
          longitude: p.longitude,
          city: p.city,
          averageRating: p.averageRating,
          reviewCount: p.reviewCount,
          priceLevel: p.priceLevel,
          category: p.category,
          primaryPhotoUrl: p.primaryPhotoUrl,
        }),
      );

      if (googlePlaces.length > 0) {
        setPlaces((prev) => {
          const existingIds = new Set(prev.map((p) => p.id));
          const newUnique = googlePlaces.filter((p) => !existingIds.has(p.id));
          return [...newUnique, ...prev];
        });
      }
      setNearbyStatus("done");
    } catch (err) {
      console.warn("Google Nearby failed:", err);
      setNearbyStatus("error");
    }
  };

  const handleLocateUser = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }
    setSelectedCity("");
    setNearbyStatus("locating");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setUserLocation({ latitude: lat, longitude: lng });
        fetchGoogleNearbyRestaurants(lat, lng);
      },
      (err) => {
        setNearbyStatus("error");
        console.warn("Geolocation error:", err.message);
        alert("Unable to retrieve your location. Please allow location access in your browser.");
      },
      { enableHighAccuracy: true, timeout: 12000 },
    );
  };

  const filteredPlaces = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    let result = places;
    if (q) {
      result = places.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.city.toLowerCase().includes(q) ||
          p.category?.toLowerCase().includes(q),
      );
    }

    const targetCity = (selectedCity || location.city || "").toLowerCase().trim();

    return [...result].sort((a, b) => {
      // 1. If GPS location available, sort by distance in km
      if (userLocation) {
        const dA = getDistanceKm(userLocation.latitude, userLocation.longitude, a.latitude, a.longitude);
        const dB = getDistanceKm(userLocation.latitude, userLocation.longitude, b.latitude, b.longitude);
        return dA - dB;
      }
      // 2. Prioritize target city places to appear AT THE TOP OF THE LIST
      const aMatch = targetCity && a.city.toLowerCase().includes(targetCity) ? 1 : 0;
      const bMatch = targetCity && b.city.toLowerCase().includes(targetCity) ? 1 : 0;
      if (aMatch !== bMatch) return bMatch - aMatch;
      return 0;
    });
  }, [places, searchQuery, userLocation, location.city, selectedCity]);

  return (
    <div className="flex h-[calc(100vh-4rem)] overflow-hidden">
      {/* ── Sidebar ───────────────────────────────────────────────────── */}
      <aside
        className={cn(
          "flex flex-col border-r border-zinc-200 bg-white transition-all duration-300",
          sidebarOpen ? "w-80 shrink-0" : "w-0 overflow-hidden",
        )}
      >
        {/* Sidebar header */}
        <div className="flex items-center justify-between border-b border-zinc-100 p-4">
          <div className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-red-600" />
            <h1 className="text-base font-bold text-zinc-900">
              Discover Places
            </h1>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="rounded-lg p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700"
            aria-label="Close sidebar"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Search & City Filter */}
        <div className="border-b border-zinc-100 p-3 flex flex-col gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search places, cuisines…"
              className="w-full rounded-xl border border-zinc-200 bg-zinc-50 py-2 pl-9 pr-3 text-sm outline-none focus:border-red-400 focus:ring-2 focus:ring-red-200"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-700"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          <CitySelector
            value={selectedCity}
            onChange={setSelectedCity}
            placeholder="Focus City on Map..."
            className="w-full"
          />

          <button
            onClick={handleLocateUser}
            disabled={nearbyStatus === "locating" || nearbyStatus === "fetching"}
            className="flex items-center justify-center gap-1.5 rounded-xl border border-red-200 bg-red-50 hover:bg-red-100 text-red-700 py-2 text-xs font-bold transition-colors disabled:opacity-60"
          >
            {nearbyStatus === "locating" && "📡 Getting your location…"}
            {nearbyStatus === "fetching" && "🔍 Loading Google restaurants…"}
            {nearbyStatus === "done" && "✅ Restaurants loaded! Search again?"}
            {nearbyStatus === "error" && "⚠️ Failed — try again"}
            {nearbyStatus === "idle" && "📍 Find Restaurants Near Me (Google)"}
          </button>

          {nearbyStatus === "done" && (
            <p className="text-center text-[10px] text-emerald-600 font-semibold">
              Showing live Google Places near you. Tap any to review!
            </p>
          )}
        </div>

        {/* Results count */}
        <div className="flex items-center justify-between px-4 py-2">
          <span className="text-xs font-medium text-zinc-500">
            {filteredPlaces.length} place{filteredPlaces.length !== 1 ? "s" : ""} found
          </span>
          <Link
            href="/places"
            className="flex items-center gap-1 text-xs font-semibold text-red-600 hover:text-red-700"
          >
            <LayoutList className="h-3.5 w-3.5" /> List view
          </Link>
        </div>

        {/* Place list */}
        <div className="flex-1 overflow-y-auto p-3">
          <div className="flex flex-col gap-2">
            {filteredPlaces.length === 0 ? (
              <div className="flex flex-col items-center gap-2 py-12 text-zinc-400">
                <Search className="h-8 w-8" />
                <p className="text-sm">No places match your search</p>
              </div>
            ) : (
              filteredPlaces.map((place) => (
                <PlaceListCard
                  key={place.id}
                  place={place}
                  isActive={activePlaceId === place.id}
                  userLocation={userLocation}
                  onClick={() =>
                    setActivePlaceId(
                      activePlaceId === place.id ? null : place.id,
                    )
                  }
                />
              ))
            )}
          </div>
        </div>

        {/* Sidebar footer */}
        <div className="border-t border-zinc-100 p-3 flex flex-col gap-1">
          <p className="text-center text-[10px] text-zinc-400">
            Powered by Google Places API · Map © OpenStreetMap
          </p>
          <p className="text-center text-[10px] text-zinc-400">
            Tap a restaurant to see details & write a review
          </p>
        </div>
      </aside>

      {/* ── Map Area ──────────────────────────────────────────────────── */}
      <div className="relative flex-1">
        {/* Toggle sidebar button (when closed) */}
        {!sidebarOpen && (
          <button
            onClick={() => setSidebarOpen(true)}
            className="absolute left-4 top-4 z-[400] flex items-center gap-2 rounded-xl bg-white px-3 py-2 text-sm font-semibold text-zinc-800 shadow-lg hover:shadow-xl transition-shadow"
          >
            <SlidersHorizontal className="h-4 w-4 text-red-600" />
            Show places list
          </button>
        )}

        <PlacesMap
          places={places}
          activePlaceId={activePlaceId}
          userLocation={userLocation}
          focusedCity={selectedCity || location.city}
          onLocateUser={handleLocateUser}
          height="h-full"
          className="h-full rounded-none border-0"
          onPlaceSelect={(id) =>
            setActivePlaceId(activePlaceId === id ? null : id)
          }
        />
      </div>
    </div>
  );
}
