"use client";

import { useState, useEffect, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Search, MapPin, UtensilsCrossed } from "lucide-react";
import RestaurantCard from "@/components/common/RestaurantCard";

interface SearchPlace {
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
}

function SearchContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") ?? "";
  const initialCity = searchParams.get("city") ?? "";

  const [query, setQuery] = useState(initialQuery);
  const [city, setCity] = useState(initialCity);
  const [places, setPlaces] = useState<SearchPlace[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSearchPlaces() {
      setLoading(true);
      try {
        const res = await fetch("/api/places");
        if (res.ok) {
          const data = await res.json();
          const mapped: SearchPlace[] = (data.places || []).map((p: any) => ({
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
          }));
          setPlaces(mapped);
        }
      } catch (err) {
        console.error("Failed to fetch search places", err);
      } finally {
        setLoading(false);
      }
    }
    fetchSearchPlaces();
  }, []);

  const results = useMemo(() => {
    return places.filter((r) => {
      if (
        query &&
        !r.name.toLowerCase().includes(query.toLowerCase()) &&
        !r.cuisine.toLowerCase().includes(query.toLowerCase()) &&
        !r.city.toLowerCase().includes(query.toLowerCase()) &&
        !(r.state && r.state.toLowerCase().includes(query.toLowerCase()))
      ) {
        return false;
      }
      if (city && !r.city.toLowerCase().includes(city.toLowerCase())) {
        return false;
      }
      return true;
    });
  }, [places, query, city]);

  return (
    <div className="bg-zinc-50 min-h-screen py-12 px-4">
      <div className="container">
        {/* Header */}
        <div className="mb-8 text-center max-w-xl mx-auto">
          <h1 className="text-3xl font-extrabold text-zinc-900">
            Food & Restaurant Search
          </h1>
          <p className="mt-2 text-sm text-zinc-500">
            Find dish recommendations, top-rated restaurants, and cafes across India.
          </p>

          {/* Search Inputs */}
          <div className="mt-6 flex flex-col gap-2 rounded-2xl bg-white p-2 shadow-lg sm:flex-row border border-zinc-200">
            <div className="flex flex-1 items-center gap-3 rounded-xl px-4 py-2.5">
              <Search className="h-4 w-4 text-zinc-400 shrink-0" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Biryani, Butter Chicken, Jaipur, Cafes..."
                className="w-full text-sm outline-none text-zinc-900"
              />
            </div>
            <div className="flex items-center gap-3 rounded-xl px-4 py-2.5 sm:w-56 border-t sm:border-t-0 sm:border-l border-zinc-100">
              <MapPin className="h-4 w-4 text-zinc-400 shrink-0" />
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="City (e.g. Mumbai, Jaipur...)"
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
        {loading ? (
          <div className="p-12 text-center text-sm font-medium text-zinc-400">
            Searching restaurants...
          </div>
        ) : results.length > 0 ? (
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
              Try searching for &ldquo;Biryani&rdquo;, &ldquo;North Indian&rdquo;, or &ldquo;Jaipur&rdquo;.
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
