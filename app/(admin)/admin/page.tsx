"use client";

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
} from "lucide-react";

// Mock metrics for Admin
const METRICS = [
  {
    title: "Total Restaurants",
    value: "2,480",
    change: "+12 this week",
    icon: UtensilsCrossed,
    color: "bg-blue-500",
  },
  {
    title: "Total Diner Reviews",
    value: "14,920",
    change: "+184 today",
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
    value: "18",
    change: "Requires review",
    icon: ShieldAlert,
    color: "bg-amber-500",
  },
];

const RECENT_RESTAURANTS = [
  {
    id: "1",
    name: "Bukhara - ITC Maurya",
    city: "New Delhi",
    cuisine: "North Indian",
    rating: 4.9,
    status: "Active",
    addedDate: "Today",
  },
  {
    id: "2",
    name: "Karavalli Heritage Kitchen",
    city: "Bengaluru",
    cuisine: "Coastal Indian",
    rating: 4.7,
    status: "Active",
    addedDate: "Yesterday",
  },
  {
    id: "3",
    name: "The Yellow Chilli",
    city: "Pune",
    cuisine: "North Indian",
    rating: 4.4,
    status: "Pending",
    addedDate: "2 days ago",
  },
];

const RECENT_REVIEWS = [
  {
    id: "r1",
    user: "Vikram R.",
    restaurant: "Trishna Coastal Dining",
    rating: 5,
    comment: "The Garlic Butter Crab is absolute heaven. Best seafood in Mumbai!",
    time: "10 mins ago",
    status: "Approved",
  },
  {
    id: "r2",
    user: "Ananya S.",
    restaurant: "Paradise Biryani House",
    rating: 4,
    comment: "Authentic spices and tender mutton pieces. Great service as always.",
    time: "25 mins ago",
    status: "Approved",
  },
  {
    id: "r3",
    user: "Dev K.",
    restaurant: "Indian Accent",
    rating: 1,
    comment: "Spam review test query text...",
    time: "1 hour ago",
    status: "Flagged",
  },
];

export default function AdminDashboardPage() {
  return (
    <div className="flex flex-col gap-8">
      {/* Top Bar / Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-zinc-900">
            Restaurant Admin Dashboard
          </h1>
          <p className="mt-1 text-sm text-zinc-500">
            Manage restaurant listings, moderate diner reviews, and monitor system metrics.
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

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {METRICS.map((metric) => (
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
            {RECENT_RESTAURANTS.map((item) => (
              <div key={item.id} className="flex items-center justify-between py-3.5">
                <div>
                  <h3 className="font-semibold text-zinc-900 text-sm">{item.name}</h3>
                  <p className="text-xs text-zinc-500">
                    {item.cuisine} · {item.city}
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
            ))}
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
            {RECENT_REVIEWS.map((rev) => (
              <div key={rev.id} className="py-3.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-zinc-900">{rev.user}</span>
                  <span className="text-zinc-400 flex items-center gap-1">
                    <Clock className="h-3 w-3" /> {rev.time}
                  </span>
                </div>
                <p className="text-xs text-zinc-500 font-medium mt-0.5">
                  Re: <span className="text-zinc-800 font-semibold">{rev.restaurant}</span>
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
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
