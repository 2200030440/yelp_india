"use client";

import { useState, useEffect, useMemo } from "react";
import {
  MessageSquare,
  Star,
  CheckCircle,
  XCircle,
  Trash2,
  Clock,
  Globe2,
  Building2,
  RotateCcw,
  Search,
  RefreshCw,
} from "lucide-react";
import { INDIAN_CITIES, INDIAN_STATES, CITY_COORDINATES } from "@/constants";

interface ReviewItem {
  id: string;
  user: string;
  restaurant: string;
  city: string;
  state: string;
  rating: number;
  comment: string;
  date: string;
  status: "Approved" | "Pending" | "Rejected";
}

const INITIAL_REVIEWS: ReviewItem[] = [
  {
    id: "r1",
    user: "Vikram Malhotra",
    restaurant: "Trishna Coastal Dining",
    city: "Mumbai",
    state: "Maharashtra",
    rating: 5,
    comment:
      "The Garlic Butter Crab is absolute perfection! Served piping hot with fresh appams. Outstanding dining experience in Mumbai.",
    date: "10 minutes ago",
    status: "Approved",
  },
  {
    id: "r2",
    user: "Ananya Sharma",
    restaurant: "Paradise Biryani House",
    city: "Hyderabad",
    state: "Telangana",
    rating: 4,
    comment:
      "Great authentic Hyderabadi flavor, but the restaurant was super crowded during Sunday evening peak hours.",
    date: "25 minutes ago",
    status: "Approved",
  },
  {
    id: "r3",
    user: "Dev Kumar",
    restaurant: "Venkatesh Grand",
    city: "Guntur",
    state: "Andhra Pradesh",
    rating: 5,
    comment: "Excellent South Indian meals and crisp tiffins in Guntur!",
    date: "40 minutes ago",
    status: "Approved",
  },
  {
    id: "r4",
    user: "Sneha Patel",
    restaurant: "Bukhara - ITC Maurya",
    city: "New Delhi",
    state: "Delhi",
    rating: 5,
    comment:
      "Dal Bukhara cooked overnight for 18 hours is worth every rupee. Outstanding hospitality!",
    date: "3 hours ago",
    status: "Approved",
  },
  {
    id: "r5",
    user: "Kiran Rao",
    restaurant: "Palle vindu",
    city: "Atmakur",
    state: "Andhra Pradesh",
    rating: 5,
    comment: "Delicious local authentic Andhra food and great service.",
    date: "5 hours ago",
    status: "Pending",
  },
];

export default function ReviewModerationPage() {
  const [reviews, setReviews] = useState<ReviewItem[]>(INITIAL_REVIEWS);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedState, setSelectedState] = useState("all");
  const [selectedCity, setSelectedCity] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/reviews?t=" + Date.now());
      if (res.ok) {
        const data = await res.json();
        if (data.reviews && data.reviews.length > 0) {
          const mapped = data.reviews.map((r: any) => ({
            id: r.id,
            user: r.user?.name || "Diner",
            restaurant: r.place?.name || "Restaurant",
            city: r.place?.city || "Guntur",
            state: r.place?.state || "Andhra Pradesh",
            rating: r.rating,
            comment: r.content,
            date: new Date(r.createdAt).toLocaleDateString(),
            status: r.isApproved ? "Approved" : "Pending",
          }));
          setReviews(mapped);
        }
      }
    } catch {
      /* Keep fallback reviews */
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleApprove = (id: string) => {
    setReviews(reviews.map((r) => (r.id === id ? { ...r, status: "Approved" } : r)));
  };

  const handleReject = (id: string) => {
    setReviews(reviews.map((r) => (r.id === id ? { ...r, status: "Rejected" } : r)));
  };

  const handleDelete = (id: string) => {
    setReviews(reviews.filter((r) => r.id !== id));
  };

  // Compute available cities based on selected state
  const availableCities = useMemo(() => {
    if (selectedState === "all") {
      const revCities = reviews.map((r) => r.city).filter(Boolean);
      return Array.from(new Set([...revCities, ...INDIAN_CITIES])).sort();
    }
    const stateCities = Object.entries(CITY_COORDINATES)
      .filter(([_, data]) => data.state.toLowerCase() === selectedState.toLowerCase())
      .map(([key]) => key.charAt(0).toUpperCase() + key.slice(1));

    const revStateCities = reviews
      .filter((r) => r.state && r.state.toLowerCase() === selectedState.toLowerCase())
      .map((r) => r.city);

    return Array.from(new Set([...stateCities, ...revStateCities])).sort();
  }, [selectedState, reviews]);

  const handleStateSelect = (st: string) => {
    setSelectedState(st);
    setSelectedCity("all");
  };

  const filtered = useMemo(() => {
    return reviews.filter((r) => {
      const qLower = search.toLowerCase().trim();
      const matchesSearch =
        !qLower ||
        r.user.toLowerCase().includes(qLower) ||
        r.restaurant.toLowerCase().includes(qLower) ||
        r.comment.toLowerCase().includes(qLower) ||
        r.city.toLowerCase().includes(qLower);

      const matchesStatus =
        statusFilter === "all" ||
        r.status.toLowerCase() === statusFilter.toLowerCase();

      const matchesState =
        selectedState === "all" ||
        (r.state && r.state.toLowerCase() === selectedState.toLowerCase()) ||
        r.city.toLowerCase().includes(selectedState.toLowerCase());

      const matchesCity =
        selectedCity === "all" ||
        r.city.toLowerCase().includes(selectedCity.toLowerCase()) ||
        selectedCity.toLowerCase().includes(r.city.toLowerCase());

      return matchesSearch && matchesStatus && matchesState && matchesCity;
    });
  }, [reviews, search, statusFilter, selectedState, selectedCity]);

  const resetFilters = () => {
    setSearch("");
    setSelectedState("all");
    setSelectedCity("all");
    setStatusFilter("all");
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-zinc-900 flex items-center gap-3">
            <MessageSquare className="h-7 w-7 text-red-600" /> Diner Review Moderation
          </h1>
          <p className="mt-1 text-sm text-zinc-500">
            Moderate, approve, or reject user-submitted restaurant reviews & ratings by State and City.
          </p>
        </div>
        <button
          onClick={fetchReviews}
          className="flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-xs font-bold text-zinc-700 shadow-sm hover:bg-zinc-50 transition-colors"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} /> Refresh Reviews
        </button>
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

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-xl border border-zinc-200 bg-white px-3.5 py-2 text-xs text-zinc-800 font-bold outline-none shadow-sm cursor-pointer"
          >
            <option value="all">All Statuses</option>
            <option value="approved">Approved</option>
            <option value="pending">Pending Review</option>
            <option value="rejected">Rejected</option>
          </select>

          {/* Search Input */}
          <div className="flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-3.5 py-2 text-sm flex-1 min-w-[200px]">
            <Search className="h-4 w-4 text-zinc-400 shrink-0" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search reviews by diner or restaurant..."
              className="w-full text-xs text-zinc-900 outline-none font-medium placeholder:text-zinc-400"
            />
          </div>
        </div>

        {/* Filter Pills Bar */}
        <div className="flex flex-wrap items-center justify-between border-t border-zinc-100 pt-2.5 text-xs">
          <div className="flex flex-wrap items-center gap-2 text-zinc-600">
            <span className="font-semibold text-zinc-800">
              Showing <span className="text-red-600 font-extrabold">{filtered.length}</span> of{" "}
              {reviews.length} diner reviews
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
          </div>

          {(selectedState !== "all" || selectedCity !== "all" || search || statusFilter !== "all") && (
            <button
              onClick={resetFilters}
              className="flex items-center gap-1 font-bold text-red-600 hover:text-red-700 hover:underline cursor-pointer"
            >
              <RotateCcw className="h-3 w-3" /> Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Reviews list */}
      <div className="flex flex-col gap-4">
        {filtered.length === 0 ? (
          <div className="rounded-2xl border border-zinc-200 bg-white p-12 text-center text-sm text-zinc-500 shadow-sm">
            No reviews found matching your State, City, or search filters.
          </div>
        ) : (
          filtered.map((rev) => (
            <div
              key={rev.id}
              className="flex flex-col justify-between gap-4 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm md:flex-row md:items-center"
            >
              <div className="flex flex-col gap-2 flex-1">
                <div className="flex items-center gap-3">
                  <span className="font-bold text-zinc-900">{rev.user}</span>
                  <span className="text-xs text-zinc-400 flex items-center gap-1">
                    <Clock className="h-3 w-3" /> {rev.date}
                  </span>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                      rev.status === "Approved"
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        : rev.status === "Rejected"
                          ? "bg-red-50 text-red-700 border border-red-200"
                          : "bg-amber-50 text-amber-700 border border-amber-200"
                    }`}
                  >
                    {rev.status}
                  </span>
                </div>

                <div className="text-xs font-semibold text-zinc-500 flex items-center gap-2">
                  <span>Restaurant: <strong className="text-zinc-800">{rev.restaurant}</strong></span>
                  <span className="inline-flex items-center gap-1 text-zinc-600 bg-zinc-100 px-2 py-0.5 rounded">
                    📍 {rev.city}, {rev.state}
                  </span>
                </div>

                <div className="flex items-center gap-0.5 my-1">
                  {Array.from({ length: rev.rating }).map((_, i) => (
                    <Star
                      key={i}
                      className="h-3.5 w-3.5 fill-amber-400 text-amber-400"
                    />
                  ))}
                </div>

                <p className="text-sm text-zinc-700 leading-relaxed bg-zinc-50/50 p-3 rounded-xl border border-zinc-100">
                  &ldquo;{rev.comment}&rdquo;
                </p>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-zinc-100">
                {rev.status !== "Approved" && (
                  <button
                    onClick={() => handleApprove(rev.id)}
                    className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-emerald-700"
                  >
                    <CheckCircle className="h-3.5 w-3.5" /> Approve
                  </button>
                )}
                {rev.status !== "Rejected" && (
                  <button
                    onClick={() => handleReject(rev.id)}
                    className="flex items-center gap-1.5 rounded-xl border border-zinc-200 bg-white px-3.5 py-2 text-xs font-semibold text-zinc-700 hover:bg-zinc-50"
                  >
                    <XCircle className="h-3.5 w-3.5 text-red-500" /> Reject
                  </button>
                )}
                <button
                  onClick={() => handleDelete(rev.id)}
                  className="rounded-xl p-2 text-zinc-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                  title="Delete"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
