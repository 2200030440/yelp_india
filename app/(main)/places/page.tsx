"use client";

import { useState, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  Search,
  MapPin,
  Filter,
  X,
  SlidersHorizontal,
  UtensilsCrossed,
} from "lucide-react";
import RestaurantCard from "@/components/common/RestaurantCard";
import StarRating from "@/components/common/StarRating";
import { Button } from "@/components/ui/button";
import { RESTAURANT_CATEGORIES, INDIAN_CITIES, SORT_OPTIONS } from "@/constants";
import { cn } from "@/lib/utils";

// Sample Restaurant Dataset
const ALL_RESTAURANTS = [
  {
    id: "1",
    name: "Bukhara - ITC Maurya",
    slug: "bukhara-delhi",
    categorySlug: "north-indian",
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
    categorySlug: "street-food",
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
    id: "3",
    name: "Indian Accent",
    slug: "indian-accent-delhi",
    categorySlug: "fine-dining",
    cuisine: "Modern Indian Fine Dining",
    city: "New Delhi",
    rating: 4.8,
    reviewCount: 3156,
    priceLevel: 4,
    image:
      "https://images.unsplash.com/photo-1567337710282-00832b415979?w=800&q=80",
    isOpen: false,
    badge: "Top Pick",
  },
  {
    id: "4",
    name: "Paradise Biryani House",
    slug: "paradise-hyderabad",
    categorySlug: "biryani-specialty",
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
    categorySlug: "south-indian",
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
  {
    id: "6",
    name: "Saravana Bhavan",
    slug: "saravana-bhavan-chennai",
    categorySlug: "south-indian",
    cuisine: "Authentic South Indian Tiffin",
    city: "Chennai",
    rating: 4.5,
    reviewCount: 8921,
    priceLevel: 1,
    image:
      "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=800&q=80",
    isOpen: true,
    badge: "Local Favorite",
  },
  {
    id: "7",
    name: "Subbayya Gari Hotel",
    slug: "subbayya-gari-hyderabad",
    categorySlug: "south-indian",
    cuisine: "Traditional Andhra Bhojanam",
    city: "Hyderabad",
    rating: 4.8,
    reviewCount: 2140,
    priceLevel: 2,
    image:
      "https://images.unsplash.com/photo-1610192244261-3f33de3f55e4?w=800&q=80",
    isOpen: true,
    badge: "Must Try",
  },
  {
    id: "8",
    name: "Blue Tokai Coffee Roasters",
    slug: "blue-tokai-mumbai",
    categorySlug: "cafes-bakeries",
    cuisine: "Artisanal Coffee & Cafe Fare",
    city: "Mumbai",
    rating: 4.6,
    reviewCount: 1240,
    priceLevel: 2,
    image:
      "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=800&q=80",
    isOpen: true,
    badge: "Popular Cafe",
  },
  {
    id: "9",
    name: "Toit Brewpub",
    slug: "toit-bengaluru",
    categorySlug: "pubs-bars",
    cuisine: "Craft Beer & Pub Grub",
    city: "Bengaluru",
    rating: 4.7,
    reviewCount: 6890,
    priceLevel: 3,
    image:
      "https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=800&q=80",
    isOpen: true,
    badge: "Nightlife Pick",
  },
];

function PlacesContent() {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get("category") ?? "all";
  const initialCity = searchParams.get("city") ?? "all";
  const initialSearch = searchParams.get("search") ?? "";

  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [selectedCity, setSelectedCity] = useState(initialCity);
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [selectedPrice, setSelectedPrice] = useState<number | null>(null);
  const [minRating, setMinRating] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState<string>("rating");
  const [bookmarks, setBookmarks] = useState<string[]>([]);

  // Filter & Sort Logic
  const filteredRestaurants = useMemo(() => {
    return ALL_RESTAURANTS.filter((r) => {
      // Category filter
      if (selectedCategory !== "all" && r.categorySlug !== selectedCategory) {
        return false;
      }
      // City filter
      if (selectedCity !== "all" && r.city.toLowerCase() !== selectedCity.toLowerCase()) {
        return false;
      }
      // Search query
      if (
        searchQuery &&
        !r.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !r.cuisine.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !r.city.toLowerCase().includes(searchQuery.toLowerCase())
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
  }, [selectedCategory, selectedCity, searchQuery, selectedPrice, minRating, sortBy]);

  const toggleBookmark = (slug: string) => {
    setBookmarks((prev) =>
      prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug],
    );
  };

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
              Discover authentic Indian dining, top-rated biryani hubs, coastal kitchens, and luxury fine dining across 500+ cities.
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
                placeholder="Search by restaurant name, cuisine, dish..."
                className="w-full text-sm outline-none text-zinc-900"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery("")} className="text-zinc-400 hover:text-zinc-600">
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* City Dropdown */}
            <div className="flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-3 py-2.5 shadow-sm sm:w-48">
              <MapPin className="h-4 w-4 text-zinc-400 shrink-0" />
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="w-full text-sm outline-none bg-transparent text-zinc-900 font-medium"
              >
                <option value="all">All Cities</option>
                {INDIAN_CITIES.slice(0, 10).map((c) => (
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

          {/* Restaurant Grid */}
          <main className="flex-1">
            {/* Active filter summary */}
            <div className="mb-4 flex items-center justify-between text-sm">
              <p className="text-zinc-600">
                Showing <span className="font-bold text-zinc-900">{filteredRestaurants.length}</span> restaurants
              </p>
            </div>

            {/* Grid */}
            {filteredRestaurants.length > 0 ? (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {filteredRestaurants.map((r) => (
                  <RestaurantCard
                    key={r.id}
                    {...r}
                    isSaved={bookmarks.includes(r.slug)}
                    onBookmarkToggle={toggleBookmark}
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
            )}
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
