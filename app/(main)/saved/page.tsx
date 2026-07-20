"use client";

import { useState } from "react";
import Link from "next/link";
import { Heart, UtensilsCrossed } from "lucide-react";
import RestaurantCard from "@/components/common/RestaurantCard";
import { Button } from "@/components/ui/button";

const INITIAL_SAVED = [
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
];

export default function SavedPlacesPage() {
  const [savedPlaces, setSavedPlaces] = useState(INITIAL_SAVED);

  const handleRemoveBookmark = (slug: string) => {
    setSavedPlaces(savedPlaces.filter((p) => p.slug !== slug));
  };

  return (
    <div className="bg-zinc-50 min-h-screen py-10 px-4">
      <div className="container">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-red-600 uppercase tracking-widest">
            <Heart className="h-4 w-4 fill-red-600" /> Food Wishlist
          </div>
          <h1 className="text-3xl font-extrabold text-zinc-900 md:text-4xl">
            Saved Restaurants
          </h1>
          <p className="text-sm text-zinc-500">
            Keep track of restaurants you want to visit and your favourite dining spots.
          </p>
        </div>

        {/* Content */}
        {savedPlaces.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {savedPlaces.map((place) => (
              <RestaurantCard
                key={place.id}
                {...place}
                isSaved={true}
                onBookmarkToggle={handleRemoveBookmark}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-300 bg-white p-12 text-center max-w-md mx-auto">
            <UtensilsCrossed className="h-12 w-12 text-zinc-300 mb-3" />
            <h3 className="text-lg font-bold text-zinc-900">Your wishlist is empty</h3>
            <p className="mt-1 text-sm text-zinc-500">
              Bookmark restaurants while browsing to build your personalized dining wishlist.
            </p>
            <Link href="/places" className="mt-4">
              <Button variant="default">Browse Restaurants</Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
