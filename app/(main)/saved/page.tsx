"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { Heart, UtensilsCrossed, Loader2 } from "lucide-react";
import RestaurantCard from "@/components/common/RestaurantCard";
import { Button } from "@/components/ui/button";
import { favoritesApi } from "@/lib/api";
import { useToast } from "@/components/ui/toast";

interface SavedPlaceItem {
  id: string;
  name: string;
  slug: string;
  cuisine: string;
  city: string;
  rating: number;
  reviewCount: number;
  priceLevel: number;
  image: string;
  isOpen: boolean;
}

export default function SavedPlacesPage() {
  const { data: session } = useSession();
  const { toast } = useToast();
  const [savedPlaces, setSavedPlaces] = useState<SavedPlaceItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch real saved places for the logged in user
  useEffect(() => {
    if (session?.user) {
      favoritesApi
        .list()
        .then(({ favorites }) => {
          if (favorites && favorites.length > 0) {
            setSavedPlaces(
              favorites.map((f: any) => ({
                id: f.place?.id ?? f.id,
                name: f.place?.name ?? "Saved Place",
                slug: f.place?.slug ?? "",
                cuisine: f.place?.category?.name ?? "Indian Restaurant",
                city: f.place?.city ?? "India",
                rating: f.place?.averageRating ?? 4.8,
                reviewCount: f.place?.reviewCount ?? 0,
                priceLevel: f.place?.priceLevel ?? 2,
                image:
                  f.place?.photos?.[0]?.url ??
                  "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800&q=80",
                isOpen: true,
              })),
            );
          } else {
            setSavedPlaces([]);
          }
        })
        .catch(() => {
          setSavedPlaces([]);
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setSavedPlaces([]);
      setLoading(false);
    }
  }, [session]);

  const handleRemoveBookmark = async (slug: string) => {
    const target = savedPlaces.find((p) => p.slug === slug);
    if (target) {
      try {
        await favoritesApi.remove(target.id);
      } catch {
        /* ignore */
      }
      toast(`Removed "${target.name}" from your saved places`, "info");
    }
    setSavedPlaces((prev) => prev.filter((p) => p.slug !== slug));
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
            Saved Restaurants ({savedPlaces.length})
          </h1>
          <p className="text-sm text-zinc-500">
            Keep track of restaurants you want to visit and your favourite dining spots.
          </p>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex flex-col items-center justify-center p-12 text-zinc-500">
            <Loader2 className="h-8 w-8 animate-spin text-red-600 mb-2" />
            <p className="text-sm font-medium">Loading your saved places...</p>
          </div>
        ) : savedPlaces.length > 0 ? (
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
