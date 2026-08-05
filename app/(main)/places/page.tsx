"use client";

import { useState, useMemo, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";
import {
  Search,
  MapPin,
  Filter,
  X,
  SlidersHorizontal,
  UtensilsCrossed,
  Map,
  LayoutGrid,
} from "lucide-react";
import RestaurantCard from "@/components/common/RestaurantCard";
import StarRating from "@/components/common/StarRating";
import { Button } from "@/components/ui/button";
import { RESTAURANT_CATEGORIES, INDIAN_CITIES, SORT_OPTIONS } from "@/constants";
import { cn } from "@/lib/utils";
import { useLocationContext } from "@/context/LocationContext";

// Load PlacesMap client-only (Leaflet requires browser)
const PlacesMap = dynamic(
  () => import("@/components/common/PlacesMap"),
  { ssr: false, loading: () => <div className="flex h-[500px] items-center justify-center bg-zinc-100 rounded-2xl text-zinc-400"><MapPin className="h-8 w-8 animate-pulse" /></div> },
);

interface RestaurantItem {
  id: string;
  name: string;
  slug: string;
  categorySlug: string;
  cuisine: string;
  city: string;
  state?: string;
  rating: number;
  reviewCount: number;
  priceLevel: number;
  image: string;
  isOpen: boolean;
  badge: string | null;
  latitude?: number;
  longitude?: number;
  isVegOnly?: boolean;
}

function PlacesContent() {
  const { location } = useLocationContext();
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get("category") ?? "all";
  const paramCity = searchParams.get("city");
  const initialCity = paramCity || location.city || "all";
  const initialSearch = searchParams.get("search") ?? "";

  const [restaurants, setRestaurants] = useState<RestaurantItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [selectedCity, setSelectedCity] = useState(initialCity);

  useEffect(() => {
    if (!paramCity && location.city && selectedCity === "all") {
      setSelectedCity(location.city);
    }
  }, [location.city, paramCity, selectedCity]);
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [selectedPrice, setSelectedPrice] = useState<number | null>(null);
  const [minRating, setMinRating] = useState<number | null>(null);
  const [isVegOnly, setIsVegOnly] = useState(false);
  const [maxDistanceKm, setMaxDistanceKm] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState<string>("rating");
  const [viewMode, setViewMode] = useState<"list" | "map">("list");

  useEffect(() => {
    async function loadPlaces() {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (selectedCity && selectedCity !== "all") params.set("city", selectedCity);
        if (selectedCategory && selectedCategory !== "all") params.set("category", selectedCategory);
        if (searchQuery) params.set("q", searchQuery);
        params.set("limit", "200");

        const res = await fetch(`/api/places?${params.toString()}`);
        if (res.ok) {
          const data = await res.json();
          const items: RestaurantItem[] = (data.places || []).map((p: { id?: string; name: string; slug: string; latitude?: number; longitude?: number; category?: { slug?: string; name?: string }; cuisine?: string; city: string; state?: string; averageRating?: number; rating?: number; reviewCount?: number; priceLevel?: number; photos?: Array<{ url?: string }>; isFeatured?: boolean; address?: string; isVegOnly?: boolean }) => ({
            id: p.id || p.slug,
            name: p.name,
            slug: p.slug,
            categorySlug: p.category?.slug || "north-indian",
            cuisine: p.category?.name || p.cuisine || "North Indian",
            city: p.city,
            state: p.state,
            rating: p.averageRating ?? p.rating ?? 5.0,
            reviewCount: p.reviewCount ?? 1,
            priceLevel: p.priceLevel ?? 2,
            image: p.photos?.[0]?.url || "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80",
            isOpen: true,
            badge: p.isFeatured ? "Featured" : null,
            latitude: p.latitude ?? undefined,
            longitude: p.longitude ?? undefined,
            isVegOnly: p.isVegOnly || p.name.toLowerCase().includes("veg") || p.name.toLowerCase().includes("bhavan"),
          }));
          setRestaurants(items);
        }
      } catch (err) {
        console.error("Error fetching places", err);
      } finally {
        setLoading(false);
      }
    }
    loadPlaces();
  }, [selectedCity, selectedCategory, searchQuery]);

  // Dynamically extract unique cities from available restaurants + default cities list
  const availableCities = useMemo(() => {
    const citiesSet = new Set<string>();
    restaurants.forEach((r) => {
      if (r.city) citiesSet.add(r.city);
    });
    INDIAN_CITIES.forEach((c) => citiesSet.add(c));
    return Array.from(citiesSet);
  }, [restaurants]);

  // Filter & Sort Logic
  const filteredRestaurants = useMemo(() => {
    return restaurants.filter((r) => {
      // Category filter
      if (selectedCategory !== "all" && r.categorySlug !== selectedCategory) {
        return false;
      }
      // City filter
      if (selectedCity !== "all" && r.city.toLowerCase() !== selectedCity.toLowerCase()) {
        return false;
      }
      // Pure Veg filter
      if (isVegOnly && !r.isVegOnly) {
        return false;
      }
      // Search query
      if (
        searchQuery &&
        !r.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !r.cuisine.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !r.city.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !(r.state && r.state.toLowerCase().includes(searchQuery.toLowerCase()))
      ) {
        return false;
      }
      // Price filter
      if (selectedPrice !== null && r.priceLevel !== selectedPrice) {
        return false;
      }
      // Rating filter
      if (minRating !== null && r.rating < minRating) {
        return false;
      }
      return true;
    }).sort((a, b) => {
      if (sortBy === "rating") return b.rating - a.rating;
      if (sortBy === "reviewCount") return b.reviewCount - a.reviewCount;
      return b.id.localeCompare(a.id);
    });
  }, [restaurants, selectedCategory, selectedCity, searchQuery, selectedPrice, minRating, isVegOnly, sortBy]);

  const clearAllFilters = () => {
    setSelectedCategory("all");
    setSelectedCity("all");
    setSearchQuery("");
    setSelectedPrice(null);
    setMinRating(null);
    setSortBy("rating");
  };

  const hasActiveFilters =
    selectedCategory !== "all" ||
    selectedCity !== "all" ||
    searchQuery !== "" ||
    selectedPrice !== null ||
    minRating !== null;

  return (
    <div className="bg-zinc-50 min-h-screen pb-16">
      {/* Page Header */}
      <section className="bg-white border-b border-zinc-200 py-10 px-4">
        <div className="container">
          <div className="flex flex-col gap-2">
            <span className="text-xs font-semibold text-red-600 uppercase tracking-widest">
              India Dining Directory
            </span>
            <h1 className="text-3xl font-extrabold text-zinc-900 md:text-4xl">
              Explore Top Restaurants & Cafes
            </h1>
            <p className="text-sm text-zinc-500 max-w-2xl">
              Discover authentic Indian dining, top-rated biryani hubs, coastal kitchens, and luxury fine dining across all locations in India.
            </p>
          </div>

          {/* Search & Quick Filters Bar */}
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
            {/* Search Input */}
            <div className="flex flex-1 items-center gap-3 rounded-xl border border-zinc-200 bg-white px-4 py-2.5 shadow-sm focus-within:ring-2 focus-within:ring-red-500">
              <Search className="h-4 w-4 text-zinc-400 shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by restaurant name, city, state, or cuisine..."
                className="w-full text-sm outline-none text-zinc-900"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery("")} className="text-zinc-400 hover:text-zinc-600">
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* City Dropdown */}
            <div className="flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-3 py-2.5 shadow-sm sm:w-56">
              <MapPin className="h-4 w-4 text-zinc-400 shrink-0" />
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="w-full text-sm outline-none bg-transparent text-zinc-900 font-medium"
              >
                <option value="all">All Cities (India)</option>
                {availableCities.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-3 py-2.5 shadow-sm sm:w-48">
              <SlidersHorizontal className="h-4 w-4 text-zinc-400 shrink-0" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full text-sm outline-none bg-transparent text-zinc-900 font-medium"
              >
                {SORT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Cuisine Filter Pills */}
          <div className="mt-4 flex flex-wrap items-center gap-2 overflow-x-auto pb-1">
            <button
              onClick={() => setIsVegOnly(!isVegOnly)}
              className={cn(
                "rounded-full px-4 py-1.5 text-xs font-bold transition-all shrink-0 border flex items-center gap-1",
                isVegOnly
                  ? "bg-emerald-600 text-white border-emerald-600 shadow-md ring-2 ring-emerald-200"
                  : "bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100",
              )}
            >
              🌱 Pure Veg Only
            </button>
            <button
              onClick={() => setSelectedCategory("all")}
              className={cn(
                "rounded-full px-4 py-1.5 text-xs font-semibold transition-colors shrink-0",
                selectedCategory === "all"
                  ? "bg-red-600 text-white shadow-sm"
                  : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200",
              )}
            >
              All Cuisines
            </button>
            {RESTAURANT_CATEGORIES.map((cat) => (
              <button
                key={cat.slug}
                onClick={() => setSelectedCategory(cat.slug)}
                className={cn(
                  "rounded-full px-4 py-1.5 text-xs font-semibold transition-colors shrink-0",
                  selectedCategory === cat.slug
                    ? "bg-red-600 text-white shadow-sm"
                    : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200",
                )}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <div className="container py-8">
        <div className="flex flex-col gap-6 lg:flex-row">
          {/* Sidebar Filters (Desktop) */}
          <aside className="hidden w-64 shrink-0 lg:block">
            <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm flex flex-col gap-6 sticky top-24">
              <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
                <h3 className="font-bold text-zinc-900 text-sm flex items-center gap-2">
                  <Filter className="h-4 w-4 text-red-600" /> Filters
                </h3>
                {hasActiveFilters && (
                  <button
                    onClick={clearAllFilters}
                    className="text-xs font-medium text-red-600 hover:underline"
                  >
                    Clear all
                  </button>
                )}
              </div>

              {/* Distance Radius Filter */}
              <div>
                <h4 className="text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-2">
                  Distance Radius
                </h4>
                <select
                  value={maxDistanceKm ?? "all"}
                  onChange={(e) =>
                    setMaxDistanceKm(e.target.value === "all" ? null : Number(e.target.value))
                  }
                  className="w-full rounded-xl border border-zinc-200 bg-zinc-50 p-2 text-xs font-medium outline-none text-zinc-900"
                >
                  <option value="all">Any distance</option>
                  <option value="2">Within 2 km</option>
                  <option value="5">Within 5 km</option>
                  <option value="10">Within 10 km</option>
                  <option value="25">Within 25 km</option>
                </select>
              </div>

              {/* Price Level */}
              <div>
                <h4 className="text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-2">
                  Price Range
                </h4>
                <div className="flex gap-2">
                  {[1, 2, 3, 4].map((level) => (
                    <button
                      key={level}
                      onClick={() =>
                        setSelectedPrice(selectedPrice === level ? null : level)
                      }
                      className={cn(
                        "flex-1 rounded-xl py-2 text-xs font-bold border transition-colors",
                        selectedPrice === level
                          ? "bg-red-600 border-red-600 text-white"
                          : "border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50",
                      )}
                    >
                      {"₹".repeat(level)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Rating Filter */}
              <div>
                <h4 className="text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-2">
                  Minimum Rating
                </h4>
                <div className="flex flex-col gap-1.5">
                  {[4.5, 4.0, 3.5].map((r) => (
                    <button
                      key={r}
                      onClick={() => setMinRating(minRating === r ? null : r)}
                      className={cn(
                        "flex items-center justify-between rounded-xl px-3 py-2 text-xs font-medium border transition-colors",
                        minRating === r
                          ? "bg-red-50 border-red-200 text-red-700"
                          : "border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50",
                      )}
                    >
                      <StarRating rating={r} size="sm" />
                      <span>{r}★ & up</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          {/* Restaurant Grid / Map */}
          <main className="flex-1">
            {/* Active filter summary + view toggle */}
            <div className="mb-4 flex items-center justify-between text-sm">
              <p className="text-zinc-600">
                Showing <span className="font-bold text-zinc-900">{filteredRestaurants.length}</span> restaurants
              </p>
              {/* View Mode Toggle */}
              <div className="flex items-center gap-1 rounded-xl border border-zinc-200 bg-white p-1 shadow-sm">
                <button
                  onClick={() => setViewMode("list")}
                  className={cn(
                    "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all",
                    viewMode === "list"
                      ? "bg-red-600 text-white shadow-sm"
                      : "text-zinc-600 hover:bg-zinc-50",
                  )}
                >
                  <LayoutGrid className="h-3.5 w-3.5" /> List
                </button>
                <button
                  onClick={() => setViewMode("map")}
                  className={cn(
                    "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all",
                    viewMode === "map"
                      ? "bg-red-600 text-white shadow-sm"
                      : "text-zinc-600 hover:bg-zinc-50",
                  )}
                >
                  <Map className="h-3.5 w-3.5" /> Map
                </button>
              </div>
            </div>

            {/* Map View */}
            {viewMode === "map" && (
              <PlacesMap
                places={filteredRestaurants.map((r) => ({
                  id: r.id,
                  name: r.name,
                  slug: r.slug,
                  latitude: r.latitude ?? 16.5062,
                  longitude: r.longitude ?? 80.6480,
                  city: r.city,
                  averageRating: r.rating,
                  reviewCount: r.reviewCount,
                  priceLevel: r.priceLevel,
                  category: r.cuisine,
                  primaryPhotoUrl: r.image,
                }))}
                focusedCity={selectedCity !== "all" ? selectedCity : location.city}
                height="h-[550px]"
              />
            )}

            {/* List Grid */}
            {viewMode === "list" &&
              (loading ? (
                <div className="p-12 text-center text-sm font-medium text-zinc-400">
                  Loading directory...
                </div>
              ) : filteredRestaurants.length > 0 ? (
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {filteredRestaurants.map((r) => (
                    <RestaurantCard
                      key={r.id}
                      {...r}
                    />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-300 bg-white p-12 text-center">
                  <UtensilsCrossed className="h-12 w-12 text-zinc-300 mb-3" />
                  <h3 className="text-lg font-bold text-zinc-900">No restaurants found</h3>
                  <p className="mt-1 text-sm text-zinc-500 max-w-sm">
                    We couldn&apos;t find any restaurants matching your active filters. Try clearing your filters or searching for something else.
                  </p>
                  <Button onClick={clearAllFilters} variant="outline" className="mt-4">
                    Reset all filters
                  </Button>
                </div>
              ))}
          </main>
        </div>
      </div>
    </div>
  );
}

export default function PlacesPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center">Loading directory...</div>}>
      <PlacesContent />
    </Suspense>
  );
}
