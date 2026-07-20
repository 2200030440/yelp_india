"use client";

import { useState, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Search, MapPin, UtensilsCrossed } from "lucide-react";
import RestaurantCard from "@/components/common/RestaurantCard";

const SAMPLE_SEARCH_DATA = [
  {
    id: "1",
    name: "Bukhara - ITC Maurya",
    slug: "bukhara-delhi",
    cuisine: "North Indian / Tandoori",
    city: "New Delhi",
    rating: 4.9,
    reviewCount: 2847,
    priceLevel: 4,
    image:
      "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800&q=80",
    isOpen: true,
    badge: "Award Winner",
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
    image:
      "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=80",
    isOpen: true,
    badge: "Most Loved",
  },
  {
    id: "4",
    name: "Paradise Biryani House",
    slug: "paradise-hyderabad",
    cuisine: "Hyderabadi Biryani & Kebabs",
    city: "Hyderabad",
    rating: 4.6,
    reviewCount: 5432,
    priceLevel: 2,
    image:
      "https://images.unsplash.com/photo-1563379091339-03246963d7d3?w=800&q=80",
    isOpen: true,
    badge: "Iconic",
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
    image:
      "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=800&q=80",
    isOpen: true,
    badge: null,
  },
];

function SearchContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") ?? "";
  const initialCity = searchParams.get("city") ?? "";

  const [query, setQuery] = useState(initialQuery);
  const [city, setCity] = useState(initialCity);

  const results = useMemo(() => {
    return SAMPLE_SEARCH_DATA.filter((r) => {
      if (
        query &&
        !r.name.toLowerCase().includes(query.toLowerCase()) &&
        !r.cuisine.toLowerCase().includes(query.toLowerCase())
      ) {
        return false;
      }
      if (city && !r.city.toLowerCase().includes(city.toLowerCase())) {
        return false;
      }
      return true;
    });
  }, [query, city]);

  return (
    <div className="bg-zinc-50 min-h-screen py-12 px-4">
      <div className="container">
        {/* Header */}
        <div className="mb-8 text-center max-w-xl mx-auto">
          <h1 className="text-3xl font-extrabold text-zinc-900">
            Food & Restaurant Search
          </h1>
          <p className="mt-2 text-sm text-zinc-500">
            Find dish recommendations, top-rated restaurants, and cafes near you.
          </p>

          {/* Search Inputs */}
          <div className="mt-6 flex flex-col gap-2 rounded-2xl bg-white p-2 shadow-lg sm:flex-row border border-zinc-200">
            <div className="flex flex-1 items-center gap-3 rounded-xl px-4 py-2.5">
              <Search className="h-4 w-4 text-zinc-400 shrink-0" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Biryani, Butter Chicken, Cafes..."
                className="w-full text-sm outline-none text-zinc-900"
              />
            </div>
            <div className="flex items-center gap-3 rounded-xl px-4 py-2.5 sm:w-44 border-t sm:border-t-0 sm:border-l border-zinc-100">
              <MapPin className="h-4 w-4 text-zinc-400 shrink-0" />
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Mumbai, Delhi..."
                className="w-full text-sm outline-none text-zinc-900"
              />
            </div>
          </div>
        </div>

        {/* Results Header */}
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-lg font-bold text-zinc-900">
            Search Results{" "}
            {query && (
              <span className="text-red-600 font-normal">&ldquo;{query}&rdquo;</span>
            )}
          </h2>
          <span className="text-xs text-zinc-500 font-medium">
            {results.length} restaurants found
          </span>
        </div>

        {/* Results Grid */}
        {results.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {results.map((r) => (
              <RestaurantCard key={r.id} {...r} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-300 bg-white p-12 text-center">
            <UtensilsCrossed className="h-12 w-12 text-zinc-300 mb-3" />
            <h3 className="text-lg font-bold text-zinc-900">No matches found</h3>
            <p className="mt-1 text-sm text-zinc-500">
              Try searching for &ldquo;Biryani&rdquo;, &ldquo;North Indian&rdquo;, or &ldquo;Mumbai&rdquo;.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center">Searching restaurants...</div>}>
      <SearchContent />
    </Suspense>
  );
}
