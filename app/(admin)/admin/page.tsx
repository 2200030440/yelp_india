"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  UtensilsCrossed,
  MessageSquare,
  Users,
  Plus,
  Star,
  TrendingUp,
  ExternalLink,
  ShieldAlert,
  Globe2,
  Building2,
  RotateCcw,
} from "lucide-react";
import { INDIAN_CITIES, INDIAN_STATES, CITY_COORDINATES, getStateForCity } from "@/constants";

interface RestaurantItem {
  id: string;
  name: string;
  city: string;
  state: string;
  cuisine: string;
  rating: number;
  status: string;
  addedDate: string;
}

interface ReviewItem {
  id: string;
  user: string;
  restaurant: string;
  city: string;
  state: string;
  rating: number;
  comment: string;
  time: string;
  status: string;
}

export default function AdminDashboardPage() {
  const [restaurants, setRestaurants] = useState<RestaurantItem[]>([]);
  const [reviews] = useState<ReviewItem[]>([]);
  const [userCount, setUserCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  const [selectedState, setSelectedState] = useState("all");
  const [selectedCity, setSelectedCity] = useState("all");

  useEffect(() => {
    let isMounted = true;
    async function loadAdminDashboardData() {
      try {
        setLoading(true);
        const [placesRes, usersRes] = await Promise.all([
          fetch("/api/places?limit=500"),
          fetch("/api/admin/users"),
        ]);

        if (placesRes.ok) {
          const data = await placesRes.json();
          const mapped: RestaurantItem[] = (data.places || []).map((p: any) => ({
            id: p.id || p.slug,
            name: p.name,
            city: p.city,
            state: p.state || getStateForCity(p.city),
            cuisine: p.category?.name || "North Indian",
            rating: p.averageRating ?? 0,
            status: "Active",
            addedDate: new Date(p.createdAt || Date.now()).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
          }));
          if (isMounted) setRestaurants(mapped);
        }

        if (usersRes.ok) {
          const uData = await usersRes.json();
          if (isMounted) setUserCount((uData.users || []).length);
        }
      } catch (err) {
        console.error("Error loading admin dashboard data:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadAdminDashboardData();
    return () => { isMounted = false; };
  }, []);

  const availableCities = useMemo(() => {
    if (selectedState === "all") {
      return Array.from(new Set([...restaurants.map((r) => r.city), ...INDIAN_CITIES])).sort();
    }
    const stateCities = Object.entries(CITY_COORDINATES)
      .filter(([_, data]) => data.state.toLowerCase() === selectedState.toLowerCase())
      .map(([key]) => key.charAt(0).toUpperCase() + key.slice(1));

    const restStateCities = restaurants
      .filter((r) => r.state.toLowerCase() === selectedState.toLowerCase())
      .map((r) => r.city);

    return Array.from(new Set([...stateCities, ...restStateCities])).sort();
  }, [selectedState, restaurants]);

  const handleStateSelect = (st: string) => {
    setSelectedState(st);
    setSelectedCity("all");
  };

  const filteredRestaurants = useMemo(() => {
    return restaurants.filter((r) => {
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
  }, [selectedState, selectedCity, restaurants]);

  const filteredReviews = useMemo(() => {
    return reviews.filter((r) => {
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
  }, [selectedState, selectedCity, reviews]);

  const metrics = [
    {
      title: "Active Restaurants",
      value: filteredRestaurants.length.toString(),
      change: selectedState !== "all" ? `in ${selectedState}` : "Across India DB",
      icon: UtensilsCrossed,
      color: "bg-blue-500",
    },
    {
      title: "Diner Reviews",
      value: filteredReviews.length.toString(),
      change: selectedCity !== "all" ? `in ${selectedCity}` : "Verified DB",
      icon: MessageSquare,
      color: "bg-red-500",
    },
    {
      title: "Registered Foodies",
      value: userCount > 0 ? userCount.toString() : "1",
      change: "Active Accounts",
      icon: Users,
      color: "bg-green-500",
    },
    {
      title: "System Status",
      value: "100%",
      change: "DB Synced",
      icon: TrendingUp,
      color: "bg-purple-500",
    },
  ];

  return (
    <div className="space-y-8 p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">Admin Operations Console</h1>
          <p className="text-sm text-zinc-500 mt-1">
            Real-time control center for Yelp India PostgreSQL DB.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/admin/places"
            className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-red-700"
          >
            <Plus className="h-4 w-4" />
            Add Restaurant
          </Link>
        </div>
      </div>

      {/* State & City Filter Bar */}
      <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-semibold text-zinc-900">
            <Globe2 className="h-4 w-4 text-red-600" />
            Filter Database Entities by Region
          </div>
          {(selectedState !== "all" || selectedCity !== "all") && (
            <button
              onClick={() => { setSelectedState("all"); setSelectedCity("all"); }}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-red-600 hover:text-red-700"
            >
              <RotateCcw className="h-3.5 w-3.5" /> Reset Filters
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-zinc-500 mb-1.5 flex items-center gap-1">
              <Globe2 className="h-3.5 w-3.5" /> Select State
            </label>
            <select
              value={selectedState}
              onChange={(e) => handleStateSelect(e.target.value)}
              className="w-full rounded-xl border border-zinc-300 bg-white px-3.5 py-2.5 text-sm text-zinc-900 focus:border-red-500 focus:outline-none"
            >
              <option value="all">All States & Union Territories (India)</option>
              {INDIAN_STATES.map((st) => (
                <option key={st} value={st}>{st}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-500 mb-1.5 flex items-center gap-1">
              <Building2 className="h-3.5 w-3.5" /> Select City
            </label>
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="w-full rounded-xl border border-zinc-300 bg-white px-3.5 py-2.5 text-sm text-zinc-900 focus:border-red-500 focus:outline-none"
            >
              <option value="all">All Cities {selectedState !== "all" ? `in ${selectedState}` : ""}</option>
              {availableCities.map((ct) => (
                <option key={ct} value={ct}>{ct}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {metrics.map((m) => {
          const Icon = m.icon;
          return (
            <div key={m.title} className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-zinc-500">{m.title}</span>
                <div className={`rounded-xl p-2.5 text-white ${m.color}`}>
                  <Icon className="h-5 w-5" />
                </div>
              </div>
              <div className="mt-4 flex items-baseline justify-between">
                <span className="text-2xl font-bold text-zinc-900">{loading ? "..." : m.value}</span>
                <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">{m.change}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Live DB Restaurants Table */}
        <div className="rounded-2xl border border-zinc-200 bg-white shadow-sm overflow-hidden flex flex-col">
          <div className="p-5 border-b border-zinc-100 flex items-center justify-between">
            <h2 className="font-semibold text-zinc-900 flex items-center gap-2">
              <UtensilsCrossed className="h-4 w-4 text-red-600" />
              Live DB Restaurants ({filteredRestaurants.length})
            </h2>
            <Link href="/admin/places" className="text-xs font-semibold text-red-600 hover:underline">
              Manage All →
            </Link>
          </div>
          <div className="overflow-x-auto flex-1">
            {loading ? (
              <div className="p-8 text-center text-sm text-zinc-400">Loading database records...</div>
            ) : filteredRestaurants.length === 0 ? (
              <div className="p-8 text-center text-sm text-zinc-400">No places found in DB for selected region.</div>
            ) : (
              <table className="w-full text-left text-sm">
                <thead className="bg-zinc-50 text-xs font-medium text-zinc-500 uppercase border-b border-zinc-100">
                  <tr>
                    <th className="py-3 px-4">Restaurant</th>
                    <th className="py-3 px-4">City</th>
                    <th className="py-3 px-4">Cuisine</th>
                    <th className="py-3 px-4">Rating</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {filteredRestaurants.slice(0, 8).map((r) => (
                    <tr key={r.id} className="hover:bg-zinc-50/80 transition-colors">
                      <td className="py-3 px-4 font-medium text-zinc-900">{r.name}</td>
                      <td className="py-3 px-4 text-zinc-500">{r.city}</td>
                      <td className="py-3 px-4 text-zinc-500">{r.cuisine}</td>
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center gap-1 font-semibold text-amber-600 text-xs">
                          <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                          {r.rating > 0 ? r.rating.toFixed(1) : "New"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Quick Admin Actions & Portal Navigation */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm space-y-6">
          <h2 className="font-semibold text-zinc-900 flex items-center gap-2">
            <ShieldAlert className="h-4 w-4 text-red-600" />
            Quick Admin Navigation
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link
              href="/admin/places"
              className="flex flex-col gap-2 p-4 rounded-xl border border-zinc-200 bg-zinc-50/50 hover:bg-zinc-100/80 transition-all group"
            >
              <UtensilsCrossed className="h-6 w-6 text-red-600 group-hover:scale-110 transition-transform" />
              <span className="font-semibold text-zinc-900 text-sm">Restaurant Management</span>
              <span className="text-xs text-zinc-500">Add, edit or delete restaurant listings from DB.</span>
            </Link>

            <Link
              href="/admin/users"
              className="flex flex-col gap-2 p-4 rounded-xl border border-zinc-200 bg-zinc-50/50 hover:bg-zinc-100/80 transition-all group"
            >
              <Users className="h-6 w-6 text-blue-600 group-hover:scale-110 transition-transform" />
              <span className="font-semibold text-zinc-900 text-sm">User Directory</span>
              <span className="text-xs text-zinc-500">Manage registered user accounts & roles in DB.</span>
            </Link>

            <Link
              href="/admin/reviews"
              className="flex flex-col gap-2 p-4 rounded-xl border border-zinc-200 bg-zinc-50/50 hover:bg-zinc-100/80 transition-all group"
            >
              <MessageSquare className="h-6 w-6 text-emerald-600 group-hover:scale-110 transition-transform" />
              <span className="font-semibold text-zinc-900 text-sm">Review Moderation</span>
              <span className="text-xs text-zinc-500">Moderate diner reviews and ratings.</span>
            </Link>

            <Link
              href="/places"
              className="flex flex-col gap-2 p-4 rounded-xl border border-zinc-200 bg-zinc-50/50 hover:bg-zinc-100/80 transition-all group"
            >
              <ExternalLink className="h-6 w-6 text-purple-600 group-hover:scale-110 transition-transform" />
              <span className="font-semibold text-zinc-900 text-sm">Public Directory</span>
              <span className="text-xs text-zinc-500">View customer live directory view.</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
