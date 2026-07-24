"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  UtensilsCrossed,
  MessageSquare,
  Users,
  Plus,
  Star,
  Clock,
  TrendingUp,
  ExternalLink,
  ShieldAlert,
  Globe2,
  Building2,
  RotateCcw,
} from "lucide-react";
import { INDIAN_CITIES, INDIAN_STATES, CITY_COORDINATES } from "@/constants";

const ALL_RESTAURANTS = [
  {
    id: "1",
    name: "Bukhara - ITC Maurya",
    city: "New Delhi",
    state: "Delhi",
    cuisine: "North Indian",
    rating: 4.9,
    status: "Active",
    addedDate: "Today",
  },
  {
    id: "2",
    name: "Venkatesh Grand",
    city: "Guntur",
    state: "Andhra Pradesh",
    cuisine: "South Indian",
    rating: 4.8,
    status: "Active",
    addedDate: "Today",
  },
  {
    id: "3",
    name: "Palle vindu",
    city: "Atmakur",
    state: "Andhra Pradesh",
    cuisine: "Andhra Special",
    rating: 5.0,
    status: "Active",
    addedDate: "Today",
  },
  {
    id: "4",
    name: "Trishna Coastal Dining",
    city: "Mumbai",
    state: "Maharashtra",
    cuisine: "Coastal Seafood",
    rating: 4.7,
    status: "Active",
    addedDate: "Yesterday",
  },
  {
    id: "5",
    name: "Paradise Biryani House",
    city: "Hyderabad",
    state: "Telangana",
    cuisine: "Hyderabadi Biryani",
    rating: 4.6,
    status: "Active",
    addedDate: "Yesterday",
  },
];

const ALL_REVIEWS = [
  {
    id: "r1",
    user: "Vikram R.",
    restaurant: "Trishna Coastal Dining",
    city: "Mumbai",
    state: "Maharashtra",
    rating: 5,
    comment: "The Garlic Butter Crab is absolute heaven. Best seafood in Mumbai!",
    time: "10 mins ago",
    status: "Approved",
  },
  {
    id: "r2",
    user: "Ananya S.",
    restaurant: "Paradise Biryani House",
    city: "Hyderabad",
    state: "Telangana",
    rating: 4,
    comment: "Authentic spices and tender mutton pieces. Great service as always.",
    time: "25 mins ago",
    status: "Approved",
  },
  {
    id: "r3",
    user: "Dev K.",
    restaurant: "Venkatesh Grand",
    city: "Guntur",
    state: "Andhra Pradesh",
    rating: 5,
    comment: "Spicy tiffins and amazing coffee!",
    time: "40 mins ago",
    status: "Approved",
  },
];

export default function AdminDashboardPage() {
  const [selectedState, setSelectedState] = useState("all");
  const [selectedCity, setSelectedCity] = useState("all");

  const availableCities = useMemo(() => {
    if (selectedState === "all") {
      return Array.from(new Set([...ALL_RESTAURANTS.map((r) => r.city), ...INDIAN_CITIES])).sort();
    }
    const stateCities = Object.entries(CITY_COORDINATES)
      .filter(([_, data]) => data.state.toLowerCase() === selectedState.toLowerCase())
      .map(([key]) => key.charAt(0).toUpperCase() + key.slice(1));

    const restStateCities = ALL_RESTAURANTS
      .filter((r) => r.state.toLowerCase() === selectedState.toLowerCase())
      .map((r) => r.city);

    return Array.from(new Set([...stateCities, ...restStateCities])).sort();
  }, [selectedState]);

  const handleStateSelect = (st: string) => {
    setSelectedState(st);
    setSelectedCity("all");
  };

  const filteredRestaurants = useMemo(() => {
    return ALL_RESTAURANTS.filter((r) => {
      const matchesState =
        selectedState === "all" ||
        r.state.toLowerCase() === selectedState.toLowerCase() ||
        r.city.toLowerCase().includes(selectedState.toLowerCase());

      const matchesCity =
        selectedCity === "all" ||
        r.city.toLowerCase().includes(selectedCity.toLowerCase()) ||
        selectedCity.toLowerCase().includes(r.city.toLowerCase());

      return matchesState && matchesCity;
    });
  }, [selectedState, selectedCity]);

  const filteredReviews = useMemo(() => {
    return ALL_REVIEWS.filter((r) => {
      const matchesState =
        selectedState === "all" ||
        r.state.toLowerCase() === selectedState.toLowerCase() ||
        r.city.toLowerCase().includes(selectedState.toLowerCase());

      const matchesCity =
        selectedCity === "all" ||
        r.city.toLowerCase().includes(selectedCity.toLowerCase()) ||
        selectedCity.toLowerCase().includes(r.city.toLowerCase());

      return matchesState && matchesCity;
    });
  }, [selectedState, selectedCity]);

  const metrics = [
    {
      title: "Active Restaurants",
      value: filteredRestaurants.length.toString(),
      change: selectedState !== "all" ? `in ${selectedState}` : "Across India",
      icon: UtensilsCrossed,
      color: "bg-blue-500",
    },
    {
      title: "Diner Reviews",
      value: filteredReviews.length.toString(),
      change: selectedCity !== "all" ? `in ${selectedCity}` : "Verified",
      icon: MessageSquare,
      color: "bg-red-500",
    },
    {
      title: "Registered Foodies",
      value: "48,310",
      change: "+620 this week",
      icon: Users,
      color: "bg-emerald-500",
    },
    {
      title: "Pending Moderations",
      value: "2",
      change: "Requires review",
      icon: ShieldAlert,
      color: "bg-amber-500",
    },
  ];

  return (
    <div className="flex flex-col gap-8">
      {/* Top Bar / Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-zinc-900">
            Restaurant Admin Dashboard
          </h1>
          <p className="mt-1 text-sm text-zinc-500">
            Monitor system metrics, restaurant listings, and reviews by State and City.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/admin/places"
            className="flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-red-700"
          >
            <Plus className="h-4 w-4" /> Add New Restaurant
          </Link>
        </div>
      </div>

      {/* Top Location Filter Bar: State & City Dropdowns */}
      <div className="flex flex-col gap-3 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
        <div className="flex flex-wrap items-center gap-3">
          {/* State Dropdown */}
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

          {/* City Dropdown */}
          <div className="flex items-center gap-2 rounded-xl border border-zinc-200 bg-zinc-50 px-3.5 py-2 text-xs font-semibold text-zinc-700">
            <Building2 className="h-4 w-4 text-red-600 shrink-0" />
            <span>City:</span>
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="bg-transparent outline-none font-bold text-zinc-900 cursor-pointer"
            >
              <option value="all">
                {selectedState !== "all" ? `All Cities in ${selectedState}` : "All Cities"}
              </option>
              {availableCities.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {(selectedState !== "all" || selectedCity !== "all") && (
            <button
              onClick={() => {
                setSelectedState("all");
                setSelectedCity("all");
              }}
              className="flex items-center gap-1 text-xs font-bold text-red-600 hover:underline cursor-pointer"
            >
              <RotateCcw className="h-3 w-3" /> Reset Location
            </button>
          )}
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric) => (
          <div
            key={metric.title}
            className="flex flex-col justify-between rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                {metric.title}
              </span>
              <div
                className={`flex h-9 w-9 items-center justify-center rounded-xl text-white ${metric.color}`}
              >
                <metric.icon className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-4">
              <div className="text-3xl font-extrabold text-zinc-900">
                {metric.value}
              </div>
              <div className="mt-1 flex items-center gap-1 text-xs text-zinc-500">
                <TrendingUp className="h-3 w-3 text-emerald-500" />
                {metric.change}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Two Columns: Recent Restaurants & Pending Moderation */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Recent Restaurants */}
        <div className="flex flex-col rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-bold text-zinc-900 flex items-center gap-2">
              <UtensilsCrossed className="h-5 w-5 text-red-600" />
              Recently Managed Restaurants
            </h2>
            <Link
              href="/admin/places"
              className="text-xs font-semibold text-red-600 hover:text-red-700 flex items-center gap-1"
            >
              Manage all <ExternalLink className="h-3 w-3" />
            </Link>
          </div>
          <div className="divide-y divide-zinc-100">
            {filteredRestaurants.length === 0 ? (
              <div className="py-6 text-center text-xs text-zinc-500">
                No restaurants found for the selected State/City.
              </div>
            ) : (
              filteredRestaurants.map((item) => (
                <div key={item.id} className="flex items-center justify-between py-3.5">
                  <div>
                    <h3 className="font-semibold text-zinc-900 text-sm">{item.name}</h3>
                    <p className="text-xs text-zinc-500">
                      {item.cuisine} · {item.city}, {item.state}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1 text-xs font-semibold text-zinc-700">
                      <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                      {item.rating}
                    </span>
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        item.status === "Active"
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : "bg-amber-50 text-amber-700 border border-amber-200"
                      }`}
                    >
                      {item.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Reviews Moderation Feed */}
        <div className="flex flex-col rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-bold text-zinc-900 flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-red-600" />
              Recent Diner Reviews
            </h2>
            <Link
              href="/admin/reviews"
              className="text-xs font-semibold text-red-600 hover:text-red-700 flex items-center gap-1"
            >
              Moderate all <ExternalLink className="h-3 w-3" />
            </Link>
          </div>
          <div className="divide-y divide-zinc-100">
            {filteredReviews.length === 0 ? (
              <div className="py-6 text-center text-xs text-zinc-500">
                No reviews found for the selected State/City.
              </div>
            ) : (
              filteredReviews.map((rev) => (
                <div key={rev.id} className="py-3.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-zinc-900">{rev.user}</span>
                    <span className="text-zinc-400 flex items-center gap-1">
                      <Clock className="h-3 w-3" /> {rev.time}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-500 font-medium mt-0.5">
                    Re: <span className="text-zinc-800 font-semibold">{rev.restaurant}</span> (📍 {rev.city})
                  </p>
                  <p className="text-xs text-zinc-700 italic mt-1 line-clamp-1">
                    &ldquo;{rev.comment}&rdquo;
                  </p>
                  <div className="mt-2 flex items-center justify-between">
                    <div className="flex items-center gap-0.5">
                      {Array.from({ length: rev.rating }).map((_, i) => (
                        <Star key={i} className="h-3 w-3 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                        rev.status === "Approved"
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-red-50 text-red-700 border border-red-200"
                      }`}
                    >
                      {rev.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
