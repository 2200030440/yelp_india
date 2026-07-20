"use client";

import { useState } from "react";
import {
  UtensilsCrossed,
  Plus,
  Search,
  Star,
  Trash2,
  MapPin,
  X,
} from "lucide-react";
import { formatPriceLevel } from "@/lib/utils";

const INITIAL_RESTAURANTS = [
  {
    id: "1",
    name: "Bukhara - ITC Maurya",
    slug: "bukhara-delhi",
    cuisine: "North Indian",
    city: "New Delhi",
    rating: 4.9,
    reviewCount: 2847,
    priceLevel: 4,
    status: "Active",
  },
  {
    id: "2",
    name: "Trishna Coastal Dining",
    slug: "trishna-mumbai",
    cuisine: "Coastal Seafood",
    city: "Mumbai",
    rating: 4.7,
    reviewCount: 1923,
    priceLevel: 3,
    status: "Active",
  },
  {
    id: "3",
    name: "Indian Accent",
    slug: "indian-accent-delhi",
    cuisine: "Modern Indian",
    city: "New Delhi",
    rating: 4.8,
    reviewCount: 3156,
    priceLevel: 4,
    status: "Active",
  },
  {
    id: "4",
    name: "Paradise Biryani House",
    slug: "paradise-hyderabad",
    cuisine: "Hyderabadi Biryani",
    city: "Hyderabad",
    rating: 4.6,
    reviewCount: 5432,
    priceLevel: 2,
    status: "Active",
  },
  {
    id: "5",
    name: "Karavalli Heritage Kitchen",
    slug: "karavalli-bengaluru",
    cuisine: "South Indian Coastal",
    city: "Bengaluru",
    rating: 4.7,
    reviewCount: 1654,
    priceLevel: 3,
    status: "Active",
  },
];

export default function RestaurantManagementPage() {
  const [restaurants, setRestaurants] = useState(INITIAL_RESTAURANTS);
  const [search, setSearch] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [newRest, setNewRest] = useState({
    name: "",
    cuisine: "North Indian",
    city: "Mumbai",
    priceLevel: 2,
  });

  const filtered = restaurants.filter(
    (r) =>
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      r.city.toLowerCase().includes(search.toLowerCase()) ||
      r.cuisine.toLowerCase().includes(search.toLowerCase()),
  );

  const handleDelete = (id: string) => {
    setRestaurants(restaurants.filter((r) => r.id !== id));
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRest.name) return;
    const added = {
      id: String(Date.now()),
      name: newRest.name,
      slug: newRest.name.toLowerCase().replace(/\s+/g, "-"),
      cuisine: newRest.cuisine,
      city: newRest.city,
      rating: 5.0,
      reviewCount: 1,
      priceLevel: Number(newRest.priceLevel),
      status: "Active",
    };
    setRestaurants([added, ...restaurants]);
    setShowAddModal(false);
    setNewRest({ name: "", cuisine: "North Indian", city: "Mumbai", priceLevel: 2 });
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-zinc-900 flex items-center gap-3">
            <UtensilsCrossed className="h-7 w-7 text-red-600" /> Restaurant Management
          </h1>
          <p className="mt-1 text-sm text-zinc-500">
            Add, update, or remove restaurant listings across India.
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-red-700"
        >
          <Plus className="h-4 w-4" /> Add Restaurant
        </button>
      </div>

      {/* Search Bar */}
      <div className="flex items-center gap-3 rounded-xl border border-zinc-200 bg-white px-4 py-3 shadow-sm max-w-md">
        <Search className="h-4 w-4 text-zinc-400 shrink-0" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by restaurant name, cuisine, or city..."
          className="w-full text-sm text-zinc-900 outline-none"
        />
      </div>

      {/* Restaurant Table */}
      <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-zinc-200 bg-zinc-50 text-xs font-semibold text-zinc-500 uppercase tracking-wider">
              <th className="px-6 py-4">Restaurant Name</th>
              <th className="px-6 py-4">Cuisine</th>
              <th className="px-6 py-4">Location</th>
              <th className="px-6 py-4">Rating</th>
              <th className="px-6 py-4">Price</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 text-sm">
            {filtered.map((r) => (
              <tr key={r.id} className="hover:bg-zinc-50/80 transition-colors">
                <td className="px-6 py-4 font-semibold text-zinc-900">{r.name}</td>
                <td className="px-6 py-4 text-zinc-600">{r.cuisine}</td>
                <td className="px-6 py-4 text-zinc-600">
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5 text-zinc-400" /> {r.city}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className="flex items-center gap-1 font-bold text-zinc-800">
                    <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                    {r.rating}{" "}
                    <span className="text-xs font-normal text-zinc-400">
                      ({r.reviewCount})
                    </span>
                  </span>
                </td>
                <td className="px-6 py-4 font-semibold text-zinc-700">
                  {formatPriceLevel(r.priceLevel)}
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => handleDelete(r.id)}
                      className="rounded-lg p-2 text-zinc-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                      title="Delete Restaurant"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
            <div className="mb-4 flex items-center justify-between border-b border-zinc-100 pb-3">
              <h2 className="text-lg font-bold text-zinc-900">Add New Restaurant</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="rounded-lg p-1 text-zinc-400 hover:bg-zinc-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleAdd} className="flex flex-col gap-4">
              <div>
                <label className="text-xs font-semibold text-zinc-700 uppercase">
                  Restaurant Name
                </label>
                <input
                  type="text"
                  required
                  value={newRest.name}
                  onChange={(e) => setNewRest({ ...newRest, name: e.target.value })}
                  placeholder="e.g. Peshawri Restaurant"
                  className="mt-1 w-full rounded-xl border border-zinc-200 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-zinc-700 uppercase">
                    Cuisine
                  </label>
                  <select
                    value={newRest.cuisine}
                    onChange={(e) => setNewRest({ ...newRest, cuisine: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-zinc-200 px-4 py-2.5 text-sm outline-none"
                  >
                    <option value="North Indian">North Indian</option>
                    <option value="South Indian">South Indian</option>
                    <option value="Coastal Seafood">Coastal Seafood</option>
                    <option value="Hyderabadi Biryani">Hyderabadi Biryani</option>
                    <option value="Fine Dining">Fine Dining</option>
                    <option value="Street Food">Street Food</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-zinc-700 uppercase">
                    City
                  </label>
                  <select
                    value={newRest.city}
                    onChange={(e) => setNewRest({ ...newRest, city: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-zinc-200 px-4 py-2.5 text-sm outline-none"
                  >
                    <option value="Mumbai">Mumbai</option>
                    <option value="Delhi">Delhi</option>
                    <option value="Bengaluru">Bengaluru</option>
                    <option value="Hyderabad">Hyderabad</option>
                    <option value="Chennai">Chennai</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-700 uppercase">
                  Price Level (1=Budget, 4=Luxury)
                </label>
                <select
                  value={newRest.priceLevel}
                  onChange={(e) => setNewRest({ ...newRest, priceLevel: Number(e.target.value) })}
                  className="mt-1 w-full rounded-xl border border-zinc-200 px-4 py-2.5 text-sm outline-none"
                >
                  <option value={1}>₹ (Budget)</option>
                  <option value={2}>₹₹ (Moderate)</option>
                  <option value={3}>₹₹₹ (Fine Dining)</option>
                  <option value={4}>₹₹₹₹ (Luxury)</option>
                </select>
              </div>

              <div className="mt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="rounded-xl border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-red-600 px-5 py-2 text-sm font-semibold text-white hover:bg-red-700"
                >
                  Save Restaurant
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
