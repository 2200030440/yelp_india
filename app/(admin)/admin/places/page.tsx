"use client";

import { useState, useEffect, useMemo } from "react";
import {
  UtensilsCrossed,
  Plus,
  Search,
  Star,
  Trash2,
  MapPin,
  X,
  Globe,
  Phone,
  CheckCircle2,
  Map as MapIcon,
  Table as TableIcon,
  Columns,
  RotateCcw,
  Building2,
  Globe2,
} from "lucide-react";
import { formatPriceLevel } from "@/lib/utils";
import { INDIAN_CITIES, INDIAN_STATES, CITY_COORDINATES } from "@/constants";
import PhotoPicker from "@/components/common/PhotoPicker";
import dynamic from "next/dynamic";

// Dynamically import Leaflet Map (SSR disabled)
const PlacesMap = dynamic(() => import("@/components/common/PlacesMap"), {
  ssr: false,
  loading: () => (
    <div className="flex h-[550px] w-full items-center justify-center rounded-2xl bg-zinc-900 text-sm font-semibold text-zinc-400">
      📍 Loading Interactive Admin Map...
    </div>
  ),
});

interface Restaurant {
  id: string;
  name: string;
  slug: string;
  cuisine?: string;
  city: string;
  state?: string;
  address?: string;
  latitude?: number | null;
  longitude?: number | null;
  rating?: number;
  averageRating?: number;
  reviewCount?: number;
  priceLevel: number;
  category?: { name: string; slug: string };
  photos?: { url: string }[];
}

export default function RestaurantManagementPage() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters state
  const [search, setSearch] = useState("");
  const [selectedState, setSelectedState] = useState("all");
  const [selectedCity, setSelectedCity] = useState("all");
  const [viewMode, setViewMode] = useState<"table" | "map" | "split">("table");
  const [activePlaceId, setActivePlaceId] = useState<string | null>(null);

  const [showAddModal, setShowAddModal] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [newRest, setNewRest] = useState({
    name: "",
    cuisine: "North Indian",
    city: "Mumbai",
    state: "Maharashtra",
    address: "",
    postalCode: "",
    priceLevel: 2,
    phone: "",
    website: "",
    description: "",
    photoUrl: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80",
  });

  useEffect(() => {
    let isMounted = true;
    fetch("/api/places?limit=500")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (isMounted && data?.places) {
          setRestaurants(data.places);
        }
      })
      .catch((err) => console.error("Failed to load restaurants", err))
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Compute available cities based on selected state
  const availableCities = useMemo(() => {
    if (selectedState === "all") {
      // Gather cities from existing restaurants + global indian cities
      const fromPlaces = restaurants.map((r) => r.city).filter(Boolean);
      return Array.from(new Set([...fromPlaces, ...INDIAN_CITIES])).sort();
    }
    // Filter cities matching selected state from CITY_COORDINATES
    const stateCities = Object.entries(CITY_COORDINATES)
      .filter(([_, data]) => data.state.toLowerCase() === selectedState.toLowerCase())
      .map(([key]) => key.charAt(0).toUpperCase() + key.slice(1));

    const fromPlacesState = restaurants
      .filter((r) => r.state && r.state.toLowerCase() === selectedState.toLowerCase())
      .map((r) => r.city);

    return Array.from(new Set([...stateCities, ...fromPlacesState])).sort();
  }, [selectedState, restaurants]);

  // Handle state filter change
  const handleStateSelect = (st: string) => {
    setSelectedState(st);
    setSelectedCity("all"); // Reset city when state changes
  };

  // Pre-fill state & city when opening Add Modal
  const handleOpenAddModal = () => {
    const defaultState = selectedState !== "all" ? selectedState : "Maharashtra";
    const defaultCity = selectedCity !== "all" ? selectedCity : "Mumbai";
    setNewRest((prev) => ({
      ...prev,
      state: defaultState,
      city: defaultCity,
    }));
    setShowAddModal(true);
  };

  const handleCityChangeModal = (cityVal: string) => {
    const cityKey = cityVal.toLowerCase().trim();
    const matchedState = CITY_COORDINATES[cityKey]?.state;
    setNewRest((prev) => ({
      ...prev,
      city: cityVal,
      state: matchedState || prev.state,
    }));
  };

  // Filter restaurants based on search text, state, and city
  const filtered = useMemo(() => {
    return restaurants.filter((r) => {
      const qLower = search.toLowerCase().trim();
      const categoryName = r.category?.name || r.cuisine || "";
      const matchesSearch =
        !qLower ||
        r.name.toLowerCase().includes(qLower) ||
        r.city.toLowerCase().includes(qLower) ||
        (r.state && r.state.toLowerCase().includes(qLower)) ||
        (r.address && r.address.toLowerCase().includes(qLower)) ||
        categoryName.toLowerCase().includes(qLower);

      const matchesState =
        selectedState === "all" ||
        (r.state && r.state.toLowerCase() === selectedState.toLowerCase()) ||
        r.city.toLowerCase().includes(selectedState.toLowerCase());

      const matchesCity =
        selectedCity === "all" ||
        r.city.toLowerCase().includes(selectedCity.toLowerCase()) ||
        selectedCity.toLowerCase().includes(r.city.toLowerCase());

      return matchesSearch && matchesState && matchesCity;
    });
  }, [restaurants, search, selectedState, selectedCity]);

  // Convert filtered places to pins format for Leaflet PlacesMap
  const mapPins = useMemo(() => {
    return filtered.map((r) => {
      const cityKey = r.city.toLowerCase().trim();
      const coord = CITY_COORDINATES[cityKey];
      const lat = r.latitude ?? coord?.lat ?? 20.5937 + (Math.random() - 0.5) * 0.1;
      const lng = r.longitude ?? coord?.lng ?? 78.9629 + (Math.random() - 0.5) * 0.1;

      return {
        id: r.id || r.slug,
        name: r.name,
        slug: r.slug,
        latitude: lat,
        longitude: lng,
        city: r.city,
        averageRating: r.averageRating ?? r.rating ?? 5.0,
        reviewCount: r.reviewCount ?? 1,
        priceLevel: r.priceLevel,
        category: r.category?.name || r.cuisine || "Restaurant",
        primaryPhotoUrl: r.photos?.[0]?.url,
      };
    });
  }, [filtered]);

  const handleDelete = async (slugOrId: string) => {
    try {
      await fetch(`/api/places/${slugOrId}`, { method: "DELETE" });
      setRestaurants((prev) => prev.filter((r) => r.id !== slugOrId && r.slug !== slugOrId));
      showToast("Restaurant deleted successfully");
    } catch (err) {
      console.error("Failed to delete place", err);
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRest.name || !newRest.city) return;

    try {
      const payload = {
        name: newRest.name,
        cuisine: newRest.cuisine,
        city: newRest.city,
        state: newRest.state,
        address: newRest.address || `${newRest.city}, ${newRest.state}`,
        postalCode: newRest.postalCode,
        priceLevel: Number(newRest.priceLevel),
        phone: newRest.phone,
        website: newRest.website,
        description: newRest.description,
        photoUrl: newRest.photoUrl,
      };

      const res = await fetch("/api/places", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const data = await res.json();
        const created = data.place;
        setRestaurants((prev) => [created, ...prev]);
        setShowAddModal(false);
        showToast(`Successfully added "${newRest.name}" in ${newRest.city}, ${newRest.state}!`);
        setNewRest({
          name: "",
          cuisine: "North Indian",
          city: "Mumbai",
          state: "Maharashtra",
          address: "",
          postalCode: "",
          priceLevel: 2,
          phone: "",
          website: "",
          description: "",
          photoUrl: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80",
        });
      }
    } catch (err) {
      console.error("Failed to add restaurant", err);
    }
  };

  const resetFilters = () => {
    setSearch("");
    setSelectedState("all");
    setSelectedCity("all");
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-3 rounded-2xl bg-zinc-900 px-5 py-3.5 text-sm font-semibold text-white shadow-2xl animate-in fade-in slide-in-from-top-4">
          <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-zinc-900 flex items-center gap-3 tracking-tight">
            <UtensilsCrossed className="h-7 w-7 text-red-600" /> Restaurant Management & Map
          </h1>
          <p className="mt-1 text-sm text-zinc-500">
            Select State & City to filter, add, or remove restaurant listings live on the table and interactive map.
          </p>
        </div>
        <button
          onClick={handleOpenAddModal}
          className="flex items-center gap-2 rounded-xl bg-red-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-red-600/20 hover:bg-red-700 active:scale-95 transition-all"
        >
          <Plus className="h-4 w-4 stroke-[3]" /> Add Restaurant
        </button>
      </div>

      {/* Filter Toolbar: State, City, Search & View Toggle */}
      <div className="flex flex-col gap-3 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* State & City Selection */}
          <div className="flex flex-wrap items-center gap-3 flex-1 min-w-[300px]">
            {/* State Filter */}
            <div className="flex items-center gap-2 rounded-xl border border-zinc-200 bg-zinc-50 px-3.5 py-2 text-xs font-semibold text-zinc-700">
              <Globe2 className="h-4 w-4 text-red-600 shrink-0" />
              <span>State:</span>
              <select
                value={selectedState}
                onChange={(e) => handleStateSelect(e.target.value)}
                className="bg-transparent outline-none font-bold text-zinc-900 cursor-pointer"
              >
                <option value="all">All States across India</option>
                {INDIAN_STATES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            {/* City Filter */}
            <div className="flex items-center gap-2 rounded-xl border border-zinc-200 bg-zinc-50 px-3.5 py-2 text-xs font-semibold text-zinc-700">
              <Building2 className="h-4 w-4 text-red-600 shrink-0" />
              <span>City:</span>
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="bg-transparent outline-none font-bold text-zinc-900 cursor-pointer"
              >
                <option value="all">
                  {selectedState !== "all"
                    ? `All Cities in ${selectedState}`
                    : "All Cities"}
                </option>
                {availableCities.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            {/* Search Input */}
            <div className="flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-3.5 py-2 text-sm flex-1 min-w-[200px]">
              <Search className="h-4 w-4 text-zinc-400 shrink-0" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search restaurant or cuisine..."
                className="w-full text-xs text-zinc-900 outline-none font-medium placeholder:text-zinc-400"
              />
            </div>
          </div>

          {/* View Toggles */}
          <div className="flex items-center gap-1 rounded-xl border border-zinc-200 bg-zinc-100 p-1">
            <button
              onClick={() => setViewMode("table")}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                viewMode === "table"
                  ? "bg-white text-zinc-900 shadow-sm"
                  : "text-zinc-600 hover:text-zinc-900"
              }`}
              title="Table View"
            >
              <TableIcon className="h-3.5 w-3.5" /> Table
            </button>
            <button
              onClick={() => setViewMode("map")}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                viewMode === "map"
                  ? "bg-red-600 text-white shadow-sm"
                  : "text-zinc-600 hover:text-zinc-900"
              }`}
              title="Map View"
            >
              <MapIcon className="h-3.5 w-3.5" /> Map View
            </button>
            <button
              onClick={() => setViewMode("split")}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                viewMode === "split"
                  ? "bg-zinc-900 text-white shadow-sm"
                  : "text-zinc-600 hover:text-zinc-900"
              }`}
              title="Split View"
            >
              <Columns className="h-3.5 w-3.5" /> Split
            </button>
          </div>
        </div>

        {/* Active Filter Pills Bar */}
        <div className="flex flex-wrap items-center justify-between border-t border-zinc-100 pt-3 text-xs">
          <div className="flex flex-wrap items-center gap-2 text-zinc-600">
            <span className="font-semibold text-zinc-800">
              Showing <span className="text-red-600 font-extrabold">{filtered.length}</span> of{" "}
              {restaurants.length} listings
            </span>
            {selectedState !== "all" && (
              <span className="rounded-full bg-red-50 px-2.5 py-0.5 font-bold text-red-700 border border-red-200">
                State: {selectedState}
              </span>
            )}
            {selectedCity !== "all" && (
              <span className="rounded-full bg-orange-50 px-2.5 py-0.5 font-bold text-orange-700 border border-orange-200">
                City: {selectedCity}
              </span>
            )}
            {search && (
              <span className="rounded-full bg-zinc-100 px-2.5 py-0.5 font-medium text-zinc-700">
                Query: &quot;{search}&quot;
              </span>
            )}
          </div>

          {(selectedState !== "all" || selectedCity !== "all" || search) && (
            <button
              onClick={resetFilters}
              className="flex items-center gap-1 font-bold text-red-600 hover:text-red-700 hover:underline cursor-pointer"
            >
              <RotateCcw className="h-3 w-3" /> Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Main Content Areas: Table View, Map View, or Split View */}
      {viewMode === "map" ? (
        <div className="rounded-2xl border border-zinc-200 bg-white p-2 shadow-sm">
          <PlacesMap
            places={mapPins}
            activePlaceId={activePlaceId}
            focusedCity={selectedCity !== "all" ? selectedCity : selectedState !== "all" ? selectedState : undefined}
            height="h-[620px]"
            onPlaceSelect={(id) => setActivePlaceId(id)}
          />
        </div>
      ) : viewMode === "split" ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Table side */}
          <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm flex flex-col max-h-[640px]">
            <div className="overflow-y-auto flex-1">
              <table className="w-full text-left border-collapse">
                <thead className="sticky top-0 z-10 bg-zinc-50 border-b border-zinc-200 text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                  <tr>
                    <th className="px-4 py-3">Restaurant</th>
                    <th className="px-4 py-3">City</th>
                    <th className="px-4 py-3">Rating</th>
                    <th className="px-4 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 text-xs">
                  {filtered.map((r) => (
                    <tr
                      key={r.id || r.slug}
                      onClick={() => setActivePlaceId(r.id || r.slug)}
                      className={`hover:bg-zinc-50 cursor-pointer transition-colors ${
                        activePlaceId === (r.id || r.slug) ? "bg-red-50/70" : ""
                      }`}
                    >
                      <td className="px-4 py-3 font-bold text-zinc-900">{r.name}</td>
                      <td className="px-4 py-3 text-zinc-600">{r.city}</td>
                      <td className="px-4 py-3 font-bold text-zinc-800">
                        ⭐ {r.averageRating ?? r.rating ?? 5.0}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(r.slug || r.id);
                          }}
                          className="rounded-md p-1.5 text-zinc-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Map side */}
          <div className="rounded-2xl border border-zinc-200 bg-white p-2 shadow-sm max-h-[640px]">
            <PlacesMap
              places={mapPins}
              activePlaceId={activePlaceId}
              focusedCity={selectedCity !== "all" ? selectedCity : selectedState !== "all" ? selectedState : undefined}
              height="h-[620px]"
              onPlaceSelect={(id) => setActivePlaceId(id)}
            />
          </div>
        </div>
      ) : (
        /* Standard Table View */
        <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
          {loading ? (
            <div className="p-12 text-center text-sm font-medium text-zinc-400">
              Loading restaurant listings...
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-12 text-center text-sm text-zinc-500">
              No restaurants found matching your criteria.
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-zinc-200 bg-zinc-50 text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                  <th className="px-6 py-4">Restaurant Name</th>
                  <th className="px-6 py-4">Cuisine</th>
                  <th className="px-6 py-4">Location (India)</th>
                  <th className="px-6 py-4">Rating</th>
                  <th className="px-6 py-4">Price</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 text-sm">
                {filtered.map((r) => {
                  const categoryName = r.category?.name || r.cuisine || "North Indian";
                  const rating = r.averageRating ?? r.rating ?? 5.0;
                  const reviewCount = r.reviewCount ?? 1;
                  return (
                    <tr key={r.id || r.slug} className="hover:bg-zinc-50/80 transition-colors">
                      <td className="px-6 py-4 font-bold text-zinc-900">{r.name}</td>
                      <td className="px-6 py-4 text-zinc-600 font-medium">{categoryName}</td>
                      <td className="px-6 py-4 text-zinc-600">
                        <span className="inline-flex items-center gap-1.5 font-medium text-zinc-800">
                          <MapPin className="h-3.5 w-3.5 text-red-500 shrink-0" />
                          {r.city}{r.state ? `, ${r.state}` : ""}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="flex items-center gap-1 font-bold text-zinc-800">
                          <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                          {rating}{" "}
                          <span className="text-xs font-normal text-zinc-400">
                            ({reviewCount})
                          </span>
                        </span>
                      </td>
                      <td className="px-6 py-4 font-semibold text-zinc-700">
                        {formatPriceLevel(r.priceLevel)}
                      </td>
                      <td className="px-6 py-4 text-right flex items-center justify-end gap-2">
                        <button
                          onClick={() => {
                            setActivePlaceId(r.id || r.slug);
                            setViewMode("split");
                          }}
                          className="rounded-lg p-2 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-800 transition-colors"
                          title="Show on Map"
                        >
                          <MapIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(r.slug || r.id)}
                          className="rounded-lg p-2 text-zinc-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                          title="Delete Restaurant"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Add Modal — Pre-filled with active State & City */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="w-full max-w-xl rounded-3xl bg-white p-6 sm:p-8 shadow-2xl my-8">
            <div className="mb-6 flex items-center justify-between border-b border-zinc-100 pb-4">
              <div>
                <h2 className="text-xl font-extrabold text-zinc-900">Add Restaurant (India)</h2>
                <p className="text-xs text-zinc-500 mt-0.5">
                  Publish a new listing to table and map across Yelp India.
                </p>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="rounded-full p-2 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleAdd} className="flex flex-col gap-4">
              {/* Restaurant Name */}
              <div>
                <label className="text-xs font-bold text-zinc-700 uppercase tracking-wider">
                  Restaurant Name *
                </label>
                <input
                  type="text"
                  required
                  value={newRest.name}
                  onChange={(e) => setNewRest({ ...newRest, name: e.target.value })}
                  placeholder="e.g. Peshawri Restaurant / Barbeque Nation"
                  className="mt-1.5 w-full rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm text-zinc-900 placeholder-zinc-400 outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20 font-medium"
                />
              </div>

              {/* Cuisine & Price */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-zinc-700 uppercase tracking-wider">
                    Cuisine / Category
                  </label>
                  <select
                    value={newRest.cuisine}
                    onChange={(e) => setNewRest({ ...newRest, cuisine: e.target.value })}
                    className="mt-1.5 w-full rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm text-zinc-900 outline-none font-medium"
                  >
                    <option value="North Indian">North Indian</option>
                    <option value="South Indian">South Indian</option>
                    <option value="Fine Dining">Fine Dining</option>
                    <option value="Coastal Seafood">Coastal Seafood</option>
                    <option value="Hyderabadi Biryani">Hyderabadi Biryani</option>
                    <option value="Cafes & Bakeries">Cafes & Bakeries</option>
                    <option value="Street Food">Street Food</option>
                    <option value="Pubs & Bars">Pubs & Bars</option>
                    <option value="Desserts & Ice Cream">Desserts & Ice Cream</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-zinc-700 uppercase tracking-wider">
                    Price Level
                  </label>
                  <select
                    value={newRest.priceLevel}
                    onChange={(e) => setNewRest({ ...newRest, priceLevel: Number(e.target.value) })}
                    className="mt-1.5 w-full rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm text-zinc-900 outline-none font-medium"
                  >
                    <option value={1}>₹ (Budget - under ₹300)</option>
                    <option value={2}>₹₹ (Moderate - ₹300–₹700)</option>
                    <option value={3}>₹₹₹ (Fine Dining - ₹700–₹1500)</option>
                    <option value={4}>₹₹₹₹ (Luxury - ₹1500+)</option>
                  </select>
                </div>
              </div>

              {/* Location Fields: City & State */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-zinc-700 uppercase tracking-wider">
                    City (Any in India) *
                  </label>
                  <input
                    type="text"
                    required
                    list="modal-indian-cities-list"
                    value={newRest.city}
                    onChange={(e) => handleCityChangeModal(e.target.value)}
                    placeholder="e.g. Jaipur, Guntur, Kochi, Pune..."
                    className="mt-1.5 w-full rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm text-zinc-900 placeholder-zinc-400 outline-none focus:border-red-500 font-medium"
                  />
                  <datalist id="modal-indian-cities-list">
                    {availableCities.map((c) => (
                      <option key={c} value={c} />
                    ))}
                  </datalist>
                </div>

                <div>
                  <label className="text-xs font-bold text-zinc-700 uppercase tracking-wider">
                    State / Territory *
                  </label>
                  <select
                    value={newRest.state}
                    onChange={(e) => setNewRest({ ...newRest, state: e.target.value })}
                    className="mt-1.5 w-full rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm text-zinc-900 outline-none font-medium"
                  >
                    {INDIAN_STATES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Address & Pincode */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="text-xs font-bold text-zinc-700 uppercase tracking-wider">
                    Street Address / Landmark
                  </label>
                  <input
                    type="text"
                    value={newRest.address}
                    onChange={(e) => setNewRest({ ...newRest, address: e.target.value })}
                    placeholder="e.g. 12 Main Road, Near Central Market"
                    className="mt-1.5 w-full rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm text-zinc-900 placeholder-zinc-400 outline-none font-medium"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-zinc-700 uppercase tracking-wider">
                    Pincode
                  </label>
                  <input
                    type="text"
                    value={newRest.postalCode}
                    onChange={(e) => setNewRest({ ...newRest, postalCode: e.target.value })}
                    placeholder="e.g. 522002"
                    className="mt-1.5 w-full rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm text-zinc-900 placeholder-zinc-400 outline-none font-medium"
                  />
                </div>
              </div>

              {/* Phone & Website */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-zinc-700 uppercase tracking-wider flex items-center gap-1">
                    <Phone className="h-3 w-3" /> Phone Number
                  </label>
                  <input
                    type="text"
                    value={newRest.phone}
                    onChange={(e) => setNewRest({ ...newRest, phone: e.target.value })}
                    placeholder="+91 98765 43210"
                    className="mt-1.5 w-full rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm text-zinc-900 placeholder-zinc-400 outline-none font-medium"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-zinc-700 uppercase tracking-wider flex items-center gap-1">
                    <Globe className="h-3 w-3" /> Website Link
                  </label>
                  <input
                    type="url"
                    value={newRest.website}
                    onChange={(e) => setNewRest({ ...newRest, website: e.target.value })}
                    placeholder="https://example.com"
                    className="mt-1.5 w-full rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm text-zinc-900 placeholder-zinc-400 outline-none font-medium"
                  />
                </div>
              </div>

              {/* Photo Upload */}
              <PhotoPicker
                label="Restaurant Photo"
                value={newRest.photoUrl}
                onChange={(url) => setNewRest({ ...newRest, photoUrl: url })}
              />

              {/* Description */}
              <div>
                <label className="text-xs font-bold text-zinc-700 uppercase tracking-wider">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={newRest.description}
                  onChange={(e) => setNewRest({ ...newRest, description: e.target.value })}
                  placeholder="Short overview of specialty dishes, ambiance, and history..."
                  className="mt-1.5 w-full rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm text-zinc-900 placeholder-zinc-400 outline-none font-medium"
                />
              </div>

              {/* Form Buttons */}
              <div className="mt-4 flex justify-end gap-3 border-t border-zinc-100 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="rounded-xl border border-zinc-200 px-5 py-2.5 text-sm font-semibold text-zinc-700 hover:bg-zinc-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-red-600 px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-red-600/20 hover:bg-red-700 transition-all"
                >
                  Save & Publish Listing
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
